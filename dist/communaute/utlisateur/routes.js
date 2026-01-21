"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = __importDefault(require("./controllers"));
const utilisateurRouter = express_1.default.Router();
utilisateurRouter.post("/ajouterutilisateur", controllers_1.default.ajouterUtilisateur);
utilisateurRouter.get("/listeutilisateur", controllers_1.default.recupUtilisateur);
utilisateurRouter.post("/supprimerutilisateur", controllers_1.default.supprimerUtilisateur);
utilisateurRouter.post("/modifierutilisateur", controllers_1.default.modifierUtilisateur);
utilisateurRouter.post("/connexionutilisateur", controllers_1.default.connexionUtilisateur);
utilisateurRouter.post("/login", controllers_1.default.login);
exports.default = utilisateurRouter;
//# sourceMappingURL=routes.js.map