"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const functions_1 = require("../functions");
const uuid = require("uuid");
const ajouterUtilisateur = (req, res) => {
    const data = req.body;
    const io = req.io;
    services_1.default
        .ajouterUtilisateur(data)
        .then((result) => {
        req.io.emit("ajouterUtilisateur", result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const recupUtilisateur = (req, res) => {
    services_1.default
        .recupUtilisateur()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerUtilisateur = (req, res) => {
    const { idUtilisateur } = req.body;
    services_1.default
        .supprimerUtilisateur(idUtilisateur)
        .then((result) => {
        if (result) {
            req.io.emit("supprimerUtilisateur", result);
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Utilisateur non trouvé' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierUtilisateur = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierUtilisateur(data)
        .then((result) => {
        req.io.emit("modifierUtilisateur", result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const connexionUtilisateur = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Récupérez les données du corps de la requête
        const { nomUtilisateur, motDePasse } = req.body;
        // Appelez la fonction connexionUtilisateur avec les données fournies
        const utilisateur = yield services_1.default.connexionUtilisateur(nomUtilisateur, motDePasse);
        // console.log("🚀 ~ connexionUtilisateur ~ utilisateur:", utilisateur)
        // Renvoyez la réponse avec le statut 200 et les données de l'utilisateur
        res.status(200).send({ status: 1, data: utilisateur });
    }
    catch (error) {
        console.error(error);
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Récupérez les données du corps de la requête
        const data = req.body;
        // console.log("🚀 ~ login ~ data:", data)
        // Appelez la fonction login avec les données fournies
        const result = yield services_1.default.login(data);
        // console.log("🚀 ~ login ~ result:", result)
        // Renvoyez la réponse avec le statut 200 et les données de l'utilisateur
        res.status(200).send({ status: 1, data: result });
    }
    catch (error) {
        // Gérez les erreurs et renvoyez des messages d'erreur appropriés
        console.error(error);
        res.status(400).send({ status: 0, error: (0, functions_1.errorMsg)(error) });
    }
});
/**
 * reinitilaiser le mot de passe d'un utilisateur
 * @param req
 * @param res
 */
// export const reinitialiserLogin = (req: any, res: Response) => {
//   const data = req.body
//   services
//       .modifierMotDePasse(data, "reinitialiser")
//       .then((result: any) => {
//           req.io.emit('utilisateur_modifie', result)
//           res.status(200).send({ status: 1, data: result })
//       })
//       .catch((error: any) => res.status(400).send({ status: 0, error }));
// };
exports.default = {
    ajouterUtilisateur,
    recupUtilisateur,
    supprimerUtilisateur,
    modifierUtilisateur,
    connexionUtilisateur,
    login
};
//# sourceMappingURL=controllers.js.map