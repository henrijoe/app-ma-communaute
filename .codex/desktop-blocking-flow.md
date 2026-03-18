# Flow De Blocage Desktop - Backend

Ce document explique uniquement la partie backend du blocage automatique desktop.

## Role du backend

Le backend local est responsable de :

- creer la licence locale chiffree
- calculer la date d'expiration
- verifier si un utilisateur doit etre bloque
- laisser le superadmin entrer meme apres expiration
- renouveler la licence quand le superadmin debloque l'application
- exposer les endpoints utilises par le front Electron

## Constantes importantes

Les constantes sensibles sont centralisees ici :

- [sqliteSecurity.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteSecurity.ts)

Valeurs actuellement en dur :

- nom utilisateur superadmin : `Henri`
- mot de passe superadmin : `dihj060195`
- mot de passe / secret local de reference : `com2026!`

## Fichier local de licence

Le fichier de licence backend est stocke ici :

- `C:\base-communaute\.desktop-license.secure`

Le chemin du dossier SQLite local est determine ici :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

La lecture, l'ecriture et le chiffrement du fichier sont geres ici :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

## Role du fichier .active-db.json

Ce fichier ne sert pas au blocage desktop.

Il sert a memoriser quelle base SQLite locale est actuellement active.

Il est stocke ici :

- `C:\base-communaute\.active-db.json` 

La logique qui le gere se trouve ici :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

Son role concret est le suivant :

- quand plusieurs fichiers `.db` existent localement, le backend doit savoir lequel utiliser
- apres une selection ou une detection reussie, le chemin de cette base est ecrit dans `.active-db.json`
- au prochain lancement, le backend relit ce fichier pour rouvrir directement la bonne base

En resume :

- `.active-db.json` = pointeur vers la base SQLite active
- `.desktop-license.secure` = etat chiffre de la licence desktop

## Duree de validite

La duree par defaut est de :

- `40 jours`

Cette valeur est definie dans :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

## Role du fichier .active-db.json

Ce fichier ne sert pas au blocage desktop.

Il sert a memoriser quelle base SQLite locale est actuellement active.

Il est stocke ici :

- `C:\base-communaute\.active-db.json` 

La logique qui le gere se trouve ici :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

Son role concret est le suivant :

- quand plusieurs fichiers `.db` existent localement, le backend doit savoir lequel utiliser
- apres une selection ou une detection reussie, le chemin de cette base est ecrit dans `.active-db.json`
- au prochain lancement, le backend relit ce fichier pour rouvrir directement la bonne base

En resume :

- `.active-db.json` = pointeur vers la base SQLite active
- `.desktop-license.secure` = etat chiffre de la licence desktop

Constante concernee :

- `DEFAULT_DESKTOP_TRIAL_DAYS`

## Creation initiale de la licence

La licence est initialisee pendant la creation d'un utilisateur.

Fichier :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/utlisateur/services.ts)

Fonction concernee :

- `ajouterUtilisateur`

Appel important :

- `desktopControlServices.ensureDesktopLicenseInitialized(data.nomUtilisateur)`

Ce que cet appel fait :

1. verifie si le fichier `.desktop-license.secure` existe deja
2. si non, cree une configuration de licence par defaut
3. calcule `expiresAt = maintenant + 40 jours`
4. chiffre cette configuration
5. l'ecrit sur disque

## Structure de la licence

La structure de la licence est definie dans :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

## Role du fichier .active-db.json

Ce fichier ne sert pas au blocage desktop.

Il sert a memoriser quelle base SQLite locale est actuellement active.

Il est stocke ici :

- `C:\base-communaute\.active-db.json` 

La logique qui le gere se trouve ici :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

Son role concret est le suivant :

- quand plusieurs fichiers `.db` existent localement, le backend doit savoir lequel utiliser
- apres une selection ou une detection reussie, le chemin de cette base est ecrit dans `.active-db.json`
- au prochain lancement, le backend relit ce fichier pour rouvrir directement la bonne base

En resume :

- `.active-db.json` = pointeur vers la base SQLite active
- `.desktop-license.secure` = etat chiffre de la licence desktop

Type concerne :

- `DesktopLicenseConfig`

Champs principaux :

- `createdAt`
- `expiresAt`
- `manuallyBlocked`
- `blockMessage`
- `superAdminUsers`
- `lastUnlockedAt`
- `lastUnlockedBy`

## Chiffrement local

Le backend chiffre le fichier de licence avant ecriture.

Toujours dans :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

## Role du fichier .active-db.json

Ce fichier ne sert pas au blocage desktop.

Il sert a memoriser quelle base SQLite locale est actuellement active.

Il est stocke ici :

- `C:\base-communaute\.active-db.json` 

La logique qui le gere se trouve ici :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

Son role concret est le suivant :

- quand plusieurs fichiers `.db` existent localement, le backend doit savoir lequel utiliser
- apres une selection ou une detection reussie, le chemin de cette base est ecrit dans `.active-db.json`
- au prochain lancement, le backend relit ce fichier pour rouvrir directement la bonne base

En resume :

- `.active-db.json` = pointeur vers la base SQLite active
- `.desktop-license.secure` = etat chiffre de la licence desktop

Fonctions importantes :

- `encryptDesktopLicenseConfig`
- `decryptDesktopLicenseConfig`

Technique actuelle :

- algorithme : `aes-256-cbc`
- cle derivee depuis `com2026!`

## Verification du superadmin fixe

Le backend reconnait un superadmin fixe meme si aucun utilisateur base n'est trouve.

Fichier :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

## Role du fichier .active-db.json

Ce fichier ne sert pas au blocage desktop.

Il sert a memoriser quelle base SQLite locale est actuellement active.

Il est stocke ici :

- `C:\base-communaute\.active-db.json` 

La logique qui le gere se trouve ici :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

Son role concret est le suivant :

- quand plusieurs fichiers `.db` existent localement, le backend doit savoir lequel utiliser
- apres une selection ou une detection reussie, le chemin de cette base est ecrit dans `.active-db.json`
- au prochain lancement, le backend relit ce fichier pour rouvrir directement la bonne base

En resume :

- `.active-db.json` = pointeur vers la base SQLite active
- `.desktop-license.secure` = etat chiffre de la licence desktop

Fonction concernee :

- `isFixedDesktopSuperAdminCredentials`

Cette fonction compare directement :

- `Henri`
- `dihj060195`

## Verification pendant le login

La logique de connexion se trouve ici :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/utlisateur/services.ts)

Fonction concernee :

- `login`

Ordre reel de traitement :

1. si les identifiants correspondent au superadmin fixe, le backend retourne un utilisateur superadmin synthetique
2. sinon, le backend appelle `getDesktopLicenseStatus(data.nomUtilisateur)`
3. si `isBlocked = true`, la connexion est refusee
4. si l'utilisateur n'est pas bloque, le login normal continue

## Comment le backend calcule le blocage

Fichier principal :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

## Role du fichier .active-db.json

Ce fichier ne sert pas au blocage desktop.

Il sert a memoriser quelle base SQLite locale est actuellement active.

Il est stocke ici :

- `C:\base-communaute\.active-db.json` 

La logique qui le gere se trouve ici :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

Son role concret est le suivant :

- quand plusieurs fichiers `.db` existent localement, le backend doit savoir lequel utiliser
- apres une selection ou une detection reussie, le chemin de cette base est ecrit dans `.active-db.json`
- au prochain lancement, le backend relit ce fichier pour rouvrir directement la bonne base

En resume :

- `.active-db.json` = pointeur vers la base SQLite active
- `.desktop-license.secure` = etat chiffre de la licence desktop

Fonction concernee :

- `getDesktopLicenseStatus`

Cette fonction fait :

1. lecture de la licence locale
2. detection du superadmin
3. verification de la date `expiresAt`
4. verification de `manuallyBlocked`
5. calcul du resultat final

Le resultat renvoye contient :

- `isBlocked`
- `isSuperAdmin`
- `expiresAt`
- `manuallyBlocked`
- `blockMessage`
- `daysRemaining`
- `sqliteReferencePassword`
- `sqliteSecurityNote`

## Regle de blocage

La regle backend actuelle est simple :

- utilisateur normal :
  - bloque si la licence est expiree
  - bloque si `manuallyBlocked = true`
- superadmin :
  - jamais bloque par cette regle

## Deblocage par le superadmin

Le debloquage est gere ici :

- [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)

## Role du fichier .active-db.json

Ce fichier ne sert pas au blocage desktop.

Il sert a memoriser quelle base SQLite locale est actuellement active.

Il est stocke ici :

- `C:\base-communaute\.active-db.json` 

La logique qui le gere se trouve ici :

- [sqliteDB.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteDB.ts)

Son role concret est le suivant :

- quand plusieurs fichiers `.db` existent localement, le backend doit savoir lequel utiliser
- apres une selection ou une detection reussie, le chemin de cette base est ecrit dans `.active-db.json`
- au prochain lancement, le backend relit ce fichier pour rouvrir directement la bonne base

En resume :

- `.active-db.json` = pointeur vers la base SQLite active
- `.desktop-license.secure` = etat chiffre de la licence desktop

Fonction concernee :

- `unlockDesktopLicense`

Cette fonction :

1. relit la licence courante
2. verifie que l'utilisateur qui demande est bien superadmin
3. remet `manuallyBlocked` a `false`
4. recalcule `expiresAt`
5. renseigne `lastUnlockedAt`
6. renseigne `lastUnlockedBy`
7. reecrit le fichier chiffre

## Endpoints exposes par le backend

Les routes sont declarees ici :

- [routes.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/routes.ts)

Les controllers sont ici :

- [controllers.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/controllers.ts)

Endpoints principaux :

- `GET /communaute/desktop-control/status`
- `POST /communaute/desktop-control/unlock`
- `GET /communaute/server-info`

## Fichier backend a relire en premier

Si tu veux comprendre seulement le backend, lis dans cet ordre :

1. [sqliteSecurity.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/db/sqliteSecurity.ts)
2. [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/services.ts)
3. [services.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/utlisateur/services.ts)
4. [controllers.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/controllers.ts)
5. [routes.ts](D:/Mes_projets/Ma-communaute/communaute-encours/server/src/communaute/desktop-control/routes.ts)

## Resume backend tres court

Le backend fait donc ceci :

1. cree une licence locale chiffree au premier compte
2. donne `40 jours` d'utilisation
3. bloque les comptes normaux apres expiration
4. autorise toujours `Henri` a entrer
5. permet a `Henri` de renouveler la licence

