import express, { NextFunction, Request, Response } from "express";
import { SERVER_NAME } from "./helpers/constants";
import communauteRouter from "./communaute/routes";
import mysqlDB from "./db/mysqlDB";
import sqliteDB from "./db/sqliteDB";
const qrcode = require('qrcode-terminal');
const path = require('path');
const dotenv = require('dotenv')
dotenv.config();

const app = express();
const DEFAULT_PORT = 49300;
const getConfiguredPort = () => {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    return DEFAULT_PORT;
  }

  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
    console.warn(`[Server] PORT invalide "${rawPort}". Utilisation du port ${DEFAULT_PORT}.`);
    return DEFAULT_PORT;
  }

  return parsedPort;
};
const PORT = getConfiguredPort();
const IP = require("ip").address();
const compression = require("compression");
const cors = require("cors");
const bodyParser = require("body-parser");

// creation du serveur
const httpServer = require("http").createServer(app);
/**
 * -------------------------
 * chemin du dossier contenant les clients 
 */
const htmlPath = path.join(__dirname, '..','views')
const albumDir = path.join(__dirname, '..','albums');
const sqliteRootDir = sqliteDB.getSqliteDirectory();
const memberPhotosDir = path.join(sqliteRootDir, 'photo-membre');
const galerieMediaDir = path.join(sqliteRootDir, 'galerie-evenements');
const churchLogosDir = path.join(sqliteRootDir, 'logo-eglise');

// =================================== MIDDLEWARES =========================================================

app.use(express.urlencoded({ limit: '100mb', extended: true, }));
app.use(express.json({ limit: '100mb' }));
app.use(cors({ credentials: true, optionsSuccessStatus: 200, origin: true }));
app.use(compression());
app.use(bodyParser.json());
app.use('/photos', express.static(memberPhotosDir));
app.use('/photos', express.static(albumDir));
app.use('/galerie-media', express.static(galerieMediaDir));
app.use('/church-logos', express.static(churchLogosDir));

// ===================================Socket.io configuration =======================================
const options = {
  transports: ["websocket"],
  pingTimeout: 2500,
  pingInterval: 5000,
  cors: {
    origin: ["*"],
    methods: ["GET", "POST"],
  },
};

const io = require("socket.io")(httpServer, options);
const ioMiddleware = (req: any, res: Response, next: NextFunction) => {
  req.io = io;
  next();
};
app.use(ioMiddleware);
const cnxInfos = { ip: IP, port: PORT };

require("./socket/socketIO").initializeSocket(io, cnxInfos)
  .then(() => {
    console.info(`socket.io successfully initialized`)
  })
  .catch((error) => { console.log("tunnel error", error); console.error(`app.ts:42 ~ initializeSocket ~ error:", ${error}`) });

// ============================================== FIN ==================================    

//public routes 
app.get("/test", function (_: any, res: any) {
  const msg = `ConnectÃƒÆ’Ã‚Â© au serveur ${SERVER_NAME} avec succÃƒÆ’Ã‚Â¨s!`;
  console.log(msg);
  res.status(201).send({
    status: 1,
    data: {
      message: msg,
    },
  });
});

app.use("/communaute", communauteRouter);

app.get("/db-test", (req, res) => {
  if (sqliteDB.isSqliteMode()) {
    sqliteDB.selectSqlite("SELECT 1 AS status")
      .then(() => {
        res.json({ status: "SQLite connecte" });
      })
      .catch((error) => {
        res.status(500).json({
          status: "ERREUR",
          error: error.message,
        });
      });
    return;
  }

  mysqlDB.query("SELECT 1", (err) => {
    if (err) {
      return res.status(500).json({
        status: "ERREUR",
        error: err.message,
      });
    }
    res.json({ status: "MySQL connectÃƒÆ’Ã‚Â© ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â°" });
  });
});


// Middleware personnalisÃƒÆ’Ã‚Â© qui dÃƒÆ’Ã‚Â©finit un cookie
const setAppCookie = (req, res, next) => {
  const serverUrl = `${req.protocol}://${req.get('host')}`
  res.cookie(
    "serverUrl",
    `${serverUrl}`,
    { encode: (v) => v } //sinon la valeur sera urlEncoded
  );
  next();
};

app.use(setAppCookie); // utilise le middleware personnalisÃƒÆ’Ã‚Â© qui dÃƒÆ’Ã‚Â©finit le cookie
app.use('/', express.static(htmlPath));
app.get("/*", function (req, res) {
  res.sendFile(`${htmlPath}/index.html`);
});

// //Lancement du server
const welcomeMsg = `
============================
${SERVER_NAME}
Port: ${PORT}
Ip: ${IP}
Url: "http://localhost:${PORT}"
Start: ${new Date().toLocaleString("fr-FR")}
============================
`;

/**
 * Affiche le moteur de base de donnees actif et prepare SQLite si besoin.
 */
const logDatabaseStartup = async () => {
  const databaseMode = sqliteDB.getDatabaseMode();

  if (databaseMode === "sqlite") {
    const defaultDatabasePath = await sqliteDB.ensureDefaultSqliteDatabase();
    const updatedDatabases = await sqliteDB.ensureAllSqliteDatabasesSchemasUpdated();
    console.log(`[DB] Mode actif: sqlite`);
    console.log(`[DB] Dossier SQLite: ${sqliteDB.getSqliteDirectory()}`);
    console.log(`[DB] Base SQLite active: ${defaultDatabasePath}`);
    console.log(`[DB] Bases SQLite verifiees: ${updatedDatabases.length}`);
    return;
  }

  console.log(`[DB] Mode actif: mysql`);
  console.log(
    `[DB] Cible MySQL: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  );
};

// httpServer.listen(PORT, () => {
//   console.log(welcomeMsg);
// });

const qrValue = {
  wifi: `http://${IP}:${PORT}`,
  tunnel: "non configure",
};

httpServer.once("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`[Server] Le port ${PORT} est deja utilise.`);
    console.error(`[Server] Arrete l'autre instance Node ou lance ce serveur avec un autre port.`);
    console.error(`[Server] Exemple PowerShell: $env:PORT=49301; npm run dev`);
    process.exit(1);
  }

  console.error("[Server] Erreur lors du demarrage du serveur:", error);
  process.exit(1);
});

// Ajouter recemment pour voir les logs
httpServer.listen(PORT, () => {
  try {
    console.log(welcomeMsg);
    qrcode.generate(JSON.stringify(qrValue));
    logDatabaseStartup().catch((error) => {
      console.error("[DB] Erreur lors de l'initialisation de la base:", error);
    });
  } catch (err) {
    console.error('Erreur lors du dÃƒÆ’Ã‚Â©marrage du serveur:', err);
  }
});





