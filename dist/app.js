"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const constants_1 = require("./helpers/constants");
const routes_1 = __importDefault(require("./communaute/routes"));
const qrcode = require('qrcode-terminal');
const path = require('path');
const app = (0, express_1.default)();
// const PORT = 49300;
const PORT = process.env.PORT || 49300;
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
const htmlPath = path.join(__dirname, '..', 'views');
const albumDir = path.join(__dirname, '..', 'albums');
// =================================== MIDDLEWARES =========================================================
app.use(express_1.default.urlencoded({ limit: '100mb', extended: true, }));
app.use(express_1.default.json({ limit: '100mb' }));
app.use(cors({ credentials: true, optionsSuccessStatus: 200, origin: true }));
app.use(compression());
app.use(bodyParser.json());
app.use('/photos', express_1.default.static(albumDir));
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
const ioMiddleware = (req, res, next) => {
    req.io = io;
    next();
};
app.use(ioMiddleware);
const cnxInfos = { ip: IP, port: PORT };
require("./socket/socketIO").initializeSocket(io, cnxInfos)
    .then(() => {
    console.info(`socket.io successfully initialized`);
})
    .catch((error) => { console.log("tunnel error", error); console.error(`app.ts:42 ~ initializeSocket ~ error:", ${error}`); });
// ============================================== FIN ==================================    
//public routes 
app.get("/test", function (_, res) {
    const msg = `Connecté au serveur ${constants_1.SERVER_NAME} avec succès!`;
    console.log(msg);
    res.status(201).send({
        status: 1,
        data: {
            message: msg,
        },
    });
});
app.use("/communaute", routes_1.default);
// Middleware personnalisé qui définit un cookie
const setAppCookie = (req, res, next) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    res.cookie("serverUrl", `${serverUrl}`, { encode: (v) => v } //sinon la valeur sera urlEncoded
    );
    next();
};
app.use(setAppCookie); // utilise le middleware personnalisé qui définit le cookie
app.use('/', express_1.default.static(htmlPath));
app.get("/*", function (req, res) {
    res.sendFile(`${htmlPath}/index.html`);
});
// //Lancement du server
const welcomeMsg = `
============================
${constants_1.SERVER_NAME}
Port: ${PORT}
Ip: ${IP}
Url: "http://localhost:49300"
Start: ${new Date().toLocaleString("fr-FR")}
============================
`;
// httpServer.listen(PORT, () => {
//   console.log(welcomeMsg);
// });
// Ajouter recemment pour voir les logs
httpServer.listen(PORT, () => {
    try {
        console.log(welcomeMsg);
    }
    catch (err) {
        console.error('Erreur lors du démarrage du serveur:', err);
    }
});
const qrValue = {
    wifi: `http://${IP}:${PORT}`,
    tunnel: 'non configuré',
};
qrcode.generate(JSON.stringify(qrValue));
//# sourceMappingURL=app.js.map