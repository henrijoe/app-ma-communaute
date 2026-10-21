#!/usr/bin/env bash
#
# Déploiement de Ma Communauté sur un serveur Linux (VM Oracle Cloud, VPS...).
#
# Le serveur Express sert l'API *et* le front : il n'y a donc qu'un seul processus
# à déployer. Le build du front est copié dans server/views, d'où Express le sert
# (app.ts : app.use('/', express.static(htmlPath))).
#
# Usage :
#   ./scripts/deploy.sh --public-url=https://communaute.exemple.org
#   ./scripts/deploy.sh --public-url=... --skip-pull
#   ./scripts/deploy.sh --skip-front            (ne reconstruit que l'API)
#
# Les deux dépôts sont attendus côte à côte :
#   .../communaute/server   (ce dépôt)
#   .../communaute/frond    (surchargeable par --front-dir=)
#
set -euo pipefail

SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONT_DIR="${FRONT_DIR:-$SERVER_DIR/../frond}"
PUBLIC_URL="${PUBLIC_URL:-}"
PM2_APP_NAME="ma-communaute"
SKIP_PULL=0
SKIP_FRONT=0

for arg in "$@"; do
  case "$arg" in
    --public-url=*) PUBLIC_URL="${arg#*=}" ;;
    --front-dir=*)  FRONT_DIR="${arg#*=}" ;;
    --skip-pull)    SKIP_PULL=1 ;;
    --skip-front)   SKIP_FRONT=1 ;;
    -h|--help)      sed -n '2,17p' "$0"; exit 0 ;;
    *) echo "Option inconnue : $arg" >&2; exit 1 ;;
  esac
done

log()  { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m /!\\ %s\033[0m\n' "$1"; }
die()  { printf '\033[1;31m /!\\ %s\033[0m\n' "$1" >&2; exit 1; }

command -v node >/dev/null || die "Node.js est introuvable."
command -v npm  >/dev/null || die "npm est introuvable."

if [ "$SKIP_FRONT" -eq 0 ]; then
  [ -n "$PUBLIC_URL" ] || die "Indique l'URL publique : --public-url=https://ton-domaine
Sans elle, le front construit appellerait http://<hote>:49300, ce qu'un navigateur
en HTTPS refuse (contenu mixte)."
  [ -d "$FRONT_DIR" ] || die "Dossier du front introuvable : $FRONT_DIR (voir --front-dir=)"
fi

[ -f "$SERVER_DIR/.env" ] || warn "server/.env absent : l'application démarrera avec les valeurs par défaut.
     Pense notamment à SQLITE_DB_DIR et à DESKTOP_LICENSE_ENFORCED=false sur un serveur partagé."

# ---------------------------------------------------------------- récupération
if [ "$SKIP_PULL" -eq 0 ]; then
  for repo in "$SERVER_DIR" "$FRONT_DIR"; do
    if [ -d "$repo/.git" ]; then
      log "git pull dans $(basename "$repo")"
      if ! git -C "$repo" pull --ff-only; then
        die "git pull impossible dans $(basename "$repo").
Cause probable : server/views est suivi par git alors que chaque déploiement le
régénère, donc l'arbre de travail est modifié. Deux sorties :
  - cesser de le suivre sur le serveur :
      git -C \"$repo\" rm -r --cached views && echo '/views' >> \"$repo/.gitignore\"
  - ou déployer sans récupération : ./scripts/deploy.sh --skip-pull --public-url=..."
      fi
    fi
  done
fi

# ---------------------------------------------------------------------- l'API
log "Installation des dépendances du serveur"
# npm ci installe aussi les devDependencies : TypeScript est nécessaire au build.
npm --prefix "$SERVER_DIR" ci

log "Compilation du serveur (tsc -> dist/)"
npm --prefix "$SERVER_DIR" run build

# --------------------------------------------------------------------- le front
if [ "$SKIP_FRONT" -eq 0 ]; then
  log "Installation des dépendances du front"
  npm --prefix "$FRONT_DIR" ci

  log "Build du front avec VITE_API_URL=$PUBLIC_URL"
  ( cd "$FRONT_DIR" && VITE_API_URL="$PUBLIC_URL" npm run build )

  [ -f "$FRONT_DIR/dist/index.html" ] || die "Le build du front n'a produit aucun index.html."

  log "Copie du front dans server/views"
  # On prépare la nouvelle version à côté puis on permute : le dossier servi
  # n'est jamais incomplet, même une fraction de seconde.
  rm -rf "$SERVER_DIR/views.new" "$SERVER_DIR/views.old"
  cp -r "$FRONT_DIR/dist" "$SERVER_DIR/views.new"
  [ -d "$SERVER_DIR/views" ] && mv "$SERVER_DIR/views" "$SERVER_DIR/views.old"
  mv "$SERVER_DIR/views.new" "$SERVER_DIR/views"
  rm -rf "$SERVER_DIR/views.old"
fi

# ------------------------------------------------------------------------ PM2
if command -v pm2 >/dev/null; then
  if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
    log "Rechargement PM2"
    pm2 reload "$PM2_APP_NAME" --update-env
  else
    log "Premier démarrage PM2"
    pm2 start "$SERVER_DIR/ecosystem.config.js"
  fi
  pm2 save
else
  warn "PM2 n'est pas installé (npm i -g pm2). Démarrage manuel : npm run start-build"
fi

log "Déploiement terminé"
echo "  Front   : $PUBLIC_URL"
echo "  API     : $PUBLIC_URL/test"
echo "  Journal : pm2 logs $PM2_APP_NAME"
