"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterComptablilite = (req, res) => {
    const data = req.body;
    const io = req.io;
    services_1.default
        .ajouterComptablilite(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
/**
 * Récupérer une comptabilite
 * @returns
 */
const recupComptabilite = (req, res) => {
    services_1.default
        .recupComptabilite()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerComptabilite = (req, res) => {
    const { idComptabilite } = req.body;
    services_1.default
        .supprimerComptabilite(idComptabilite)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Comptabilite non trouvé' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierComptabilite = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierComptabilite(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
exports.default = {
    ajouterComptablilite,
    recupComptabilite,
    supprimerComptabilite,
    modifierComptabilite,
};
//# sourceMappingURL=controllers.js.map