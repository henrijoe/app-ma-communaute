"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterComptablilite = (req, res) => {
    const data = req.body;
    services_1.default
        .ajouterComptablilite(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const recupComptabilite = (req, res) => {
    const idUtilisateur = Number(req.params.idUtilisateur || req.query.idUtilisateur || 0);
    const serviceCall = idUtilisateur > 0
        ? services_1.default.recupComptabiliteByUtilisateur(idUtilisateur)
        : services_1.default.recupComptabilite();
    serviceCall
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const supprimerComptabilite = (req, res) => {
    var _a;
    const idComptabilite = Number(((_a = req.body) === null || _a === void 0 ? void 0 : _a.idComptabilite) || req.params.id);
    services_1.default
        .supprimerComptabilite(idComptabilite)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
const modifierComptabilite = (req, res) => {
    var _a;
    const data = Object.assign(Object.assign({}, req.body), { idComptabilite: Number(((_a = req.body) === null || _a === void 0 ? void 0 : _a.idComptabilite) || req.params.id) });
    services_1.default
        .modifierComptabilite(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error: (error === null || error === void 0 ? void 0 : error.message) || error }));
};
exports.default = {
    ajouterComptablilite,
    recupComptabilite,
    supprimerComptabilite,
    modifierComptabilite,
};
//# sourceMappingURL=controllers.js.map