# Déploiement de Ma Communauté sur un serveur Linux

Procédure pour une VM Oracle Cloud Always Free (ARM Ampere A1) ou n'importe quel VPS.

## Ce que tu déploies

Un seul processus Node. Le serveur Express sert l'API **et** le front : le build du
front est copié dans `server/views`, d'où Express le sert. Front et API partagent donc
la même origine — pas de CORS, pas de second hébergeur.

```
Navigateur ──HTTPS──> Caddy (443) ──HTTP──> Node/Express (127.0.0.1:49300)
                                                 ├── API      /communaute/*
                                                 ├── Front    server/views
                                                 └── Données  $SQLITE_DB_DIR
```

## Créer la VM sur Oracle Cloud

Tout se passe dans la console web : **cloud.oracle.com**. Compte environ 30 à 45 minutes
la première fois. Les libellés de l'interface Oracle changent régulièrement : si un
intitulé diffère, la logique reste la même.

### 1. Le compte

« Start for free ». Une carte bancaire est demandée **pour vérifier l'identité** : une
autorisation de l'ordre d'un dollar est faite puis annulée. Tant que tu restes sur des
ressources marquées *Always Free*, rien n'est facturé — et un compte gratuit ne peut de
toute façon pas provisionner de ressource payante sans passage explicite en compte payant.

**Attention au choix de la région d'origine (*home region*) : il est définitif.** Les
ressources Always Free n'existent que dans cette région. Depuis l'Afrique de l'Ouest,
Paris ou Marseille donnent la meilleure latence.

### 2. L'instance

Menu ☰ → *Compute* → *Instances* → **Create instance**.

| Réglage | Valeur |
|---|---|
| Nom | `ma-communaute` |
| Image | Canonical **Ubuntu** 22.04 ou 24.04 |
| Shape | *Change shape* → **Ampere** → `VM.Standard.A1.Flex` |
| OCPU / mémoire | 4 OCPU / 24 Go (la totalité du quota gratuit) |
| Réseau | Créer un nouveau VCN, **Assign a public IPv4 address = Yes** |
| Clés SSH | Coller ta clé publique (voir ci-dessous) |
| Boot volume | 50 Go suffisent |

Pour la clé SSH, depuis PowerShell sur ton poste :

```powershell
ssh-keygen -t ed25519 -C "ma-communaute"
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

Colle le contenu affiché dans le champ de la console. Garde la clé privée
(`id_ed25519`, sans `.pub`) : elle ne se retrouve pas.

> **Si « Out of capacity for shape VM.Standard.A1.Flex »** : c'est le message le plus
> fréquent sur l'offre gratuite ARM, la demande dépasse souvent l'offre. Réessaie plus
> tard, change de *availability domain*, ou demande 1 OCPU / 6 Go — largement suffisant
> ici — ce qui passe beaucoup plus souvent.

### 3. Fixer l'adresse IP

Par défaut l'IP publique est *éphémère* et changerait au redémarrage, ce qui casserait le
DNS et le certificat. Sur la page de l'instance : *Attached VNICs* → la VNIC → *IPv4
Addresses* → *Edit* → passer l'IP publique de **Ephemeral** à **Reserved**.

### 4. Le nom de domaine

Indispensable pour le certificat HTTPS. Deux options :

- un domaine que tu possèdes : créer un enregistrement **A** pointant vers l'IP réservée ;
- gratuit et immédiat : un sous-domaine **DuckDNS** (`ma-communaute.duckdns.org`) associé
  à l'IP. Let's Encrypt le reconnaît sans difficulté.

Vérifie la propagation avant de configurer Caddy : `nslookup ton-domaine`.

### 5. Se connecter

```powershell
ssh -i $env:USERPROFILE\.ssh\id_ed25519 ubuntu@<IP-PUBLIQUE>
```

L'utilisateur est `ubuntu` sur les images Canonical.

### 6. Installer les outils

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential python3
sudo npm install -g pm2

# Caddy (dépôt officiel)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

`build-essential` et `python3` ne servent que de filet : `sqlite3` et `bcrypt` ont des
binaires arm64 prêts à l'emploi, mais si l'un devait se recompiler, ils seront là.

Vérifie : `node -v` doit afficher v20, et `uname -m` doit afficher `aarch64`.

### 7. Cloner les deux dépôts

```bash
sudo mkdir -p /opt/ma-communaute && sudo chown "$USER" /opt/ma-communaute
cd /opt/ma-communaute
git clone <url-du-depot-server> server
git clone <url-du-depot-frond> frond
```

La suite de ce document (ouverture des ports, `.env`, `deploy.sh`, Caddy) s'applique
telle quelle.

## Récapitulatif des prérequis

À ce stade tu dois avoir : une VM Ubuntu accessible en SSH, Node 20, `git`, `pm2` et
`caddy` installés, un nom de domaine qui résout vers l'IP réservée, et les deux dépôts
clonés dans `/opt/ma-communaute/{server,frond}`.

Le nom de domaine n'est pas optionnel : Let's Encrypt ne délivre pas de certificat pour
une IP nue, et sans HTTPS le navigateur bloquera les appels d'API.

## Étapes

### 1. Ouvrir les ports — les deux pare-feux

C'est l'erreur la plus fréquente sur Oracle Cloud : il y en a **deux**, et ouvrir l'un
sans l'autre donne un serveur injoignable sans message d'erreur.

1. La *security list* (ou *network security group*) du réseau virtuel : entrées TCP 80 et 443.
2. Le pare-feu local de l'image Ubuntu, qui n'autorise que le 22 :

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

Le port 49300 n'est **pas** à ouvrir : il reste interne, derrière Caddy.

### 2. Préparer le dossier de données

Hors du dossier de code, pour survivre aux déploiements :

```bash
sudo mkdir -p /var/lib/ma-communaute
sudo chown "$USER" /var/lib/ma-communaute
```

### 3. Configurer `server/.env`

À partir de `.env.example`. Le minimum :

```ini
PORT=49300
DB_MODE=sqlite
SQLITE_DB_DIR=/var/lib/ma-communaute
DESKTOP_LICENSE_ENFORCED=false
```

`DESKTOP_LICENSE_ENFORCED=false` est **indispensable ici**. Sans cette ligne, la licence
créée au premier démarrage expire au bout de `DESKTOP_TRIAL_DAYS` (15 jours) et bloque
**tous** les comptes sauf le superadmin. Elle est de plus liée à une empreinte machine
(`hostname|platform|arch|cpu`) : redimensionner la VM ou changer son nom suffirait à
bloquer l'accès. Sur un poste client, on laisse au contraire le verrou actif.

Ajoute les variables `SMTP_*` si tu veux le flux « mot de passe oublié ».

### 4. Déployer

```bash
cd /opt/ma-communaute/server
./scripts/deploy.sh --public-url=https://communaute.exemple.org
```

Le script récupère les deux dépôts, compile l'API, construit le front avec la bonne
`VITE_API_URL`, permute `server/views` sans interruption visible, puis recharge PM2.

### 5. Démarrage automatique

```bash
pm2 save
pm2 startup     # exécuter la commande affichée
```

### 6. Caddy

```bash
sudo cp Caddyfile.example /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile     # remplacer le domaine
sudo systemctl reload caddy
```

Le certificat est obtenu et renouvelé automatiquement. Le WebSocket de Socket.IO passe
sans réglage supplémentaire.

### 7. Vérifier

```bash
curl https://communaute.exemple.org/test     # doit répondre "Connecté au serveur..."
pm2 logs ma-communaute
```

## Mettre à jour

```bash
cd /opt/ma-communaute/server && ./scripts/deploy.sh --public-url=https://communaute.exemple.org
```

Ajoute `--skip-front` pour ne recompiler que l'API.

## Sauvegardes

L'application crée déjà une archive ZIP quotidienne dans `$SQLITE_DB_DIR/sauvegardes`.
Elle est sur la même machine : elle ne protège donc pas de la perte de la VM. Prévois une
copie vers l'extérieur (`rsync`, `rclone`, stockage objet) si les données comptent.

## Points ouverts, à traiter avant d'exposer de vraies données

- **L'API n'a aucune authentification.** Les routes de lecture sont de la forme
  `/communaute/recupmembrebyutilisateur/:idUtilisateur` : il suffit de changer le numéro
  dans l'URL pour lire les membres d'une autre communauté — noms, téléphones, décès.
  Un token signé à la connexion, vérifié par un middleware, avec le périmètre tiré du
  token plutôt que de l'URL, est le prérequis à toute mise en ligne réelle.
- **Les mots de passe sont stockés en clair** dans la table `utilisateur`.
- **`POST /communaute/connexionutilisateur`** accepte n'importe quel mot de passe
  (condition inversée). Cette route n'est plus utilisée par le front : la supprimer est
  le plus simple.
- **`io.emit` diffuse à tous les clients connectés**, sans filtrage par église. Pas de
  fuite de données en soi (chaque client recharge son propre périmètre), mais du trafic
  inutile dès qu'il y a plusieurs communautés.

Tant que l'instance ne sert qu'à une démonstration avec des données fictives, ces points
sont sans conséquence.
