"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterMembre = (req, res) => {
    const data = req.body;
    const io = req.io;
    services_1.default
        .ajouterMembre(data)
        .then((result) => {
        req.io.emit("ajouterMembre", result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
/**
 * Récupérer un membre
 * @returns
 */
const recupMembre = (req, res) => {
    services_1.default
        .recupMembre()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerMembre = (req, res) => {
    const { idMembre } = req.body;
    services_1.default
        .supprimerMembre(idMembre)
        .then((result) => {
        if (result) {
            req.io.emit("supprimerMembre", result);
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Membre non trouvé' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierMembre = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierMembre(data)
        .then((result) => {
        req.io.emit("modifierMembre", result);
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const recupMembreByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req === null || req === void 0 ? void 0 : req.params;
    services_1.default
        .recupMembreByIdUtilsateur(idUtilisateur)
        .then((result) => {
        //  (req as any).io.emit("recupmembrebyutilisateur", result)
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreByIdUtilsateur
};
//# sourceMappingURL=controllers.js.map