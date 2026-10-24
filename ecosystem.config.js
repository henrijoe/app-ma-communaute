// ecosystem.config.js
// Configuration PM2 du serveur Ma Communauté (VM Oracle Cloud, VPS...).
//
//   pm2 start ecosystem.config.js
//   pm2 save && pm2 startup     (redémarrage automatique après un reboot)
//   pm2 reload ma-communaute    (après un déploiement)
//
// Les variables sensibles restent dans server/.env, lu par l'application elle-même
// (dotenv). Attention : dotenv n'écrase jamais une variable déjà présente dans
// l'environnement, donc une clé définie ici l'emporterait sur celle du .env.
module.exports = {
  apps: [
    {
      name: "ma-communaute",
      script: "dist/app.js",
      cwd: __dirname,

      // Un seul processus, en mode "fork".
      // Le mode cluster casserait deux choses : le verrou d'écriture de SQLite
      // (plusieurs processus sur le même fichier) et la diffusion Socket.IO
      // (chaque worker ne verrait que ses propres clients connectés).
      instances: 1,
      exec_mode: "fork",

      // "watch" est réservé au développement local. En production, l'application
      // écrit elle-même des fichiers (photos de membres, médias de galerie,
      // sauvegardes quotidiennes) : la surveillance provoquerait des redémarrages
      // en boucle.
      watch: false,

      env: {
        NODE_ENV: "production",
      },

      autorestart: true,
      max_memory_restart: "512M",
      // Le démarrage vérifie le schéma des bases SQLite et crée la sauvegarde
      // du jour : on laisse le temps de terminer proprement avant un kill.
      kill_timeout: 15000,

      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
