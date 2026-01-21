"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterDeces = (req, res) => {
    const data = req.body;
    console.log("🚀 ~ ajouterDeces ~ data:", data);
    const io = req.io;
    services_1.default
        .ajouterDeces(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => {
        if (error.message.includes('Ce cas de déces à  déjà enregistré.')) {
            res.status(400).send({ status: 0, error: error.message });
        }
        else {
            res.status(400).send({ status: 0, error });
        }
    });
};
/**
 * Récupérer une deces
 * @returns
 */
const recupDeces = (req, res) => {
    services_1.default
        .recupDeces()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerDeces = (req, res) => {
    const { idDeces } = req.body;
    services_1.default
        .supprimerDeces(idDeces)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Deces non trouvée' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierDeces = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierDeces(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const recupDecesByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req === null || req === void 0 ? void 0 : req.params;
    services_1.default
        .recupDecesByIdUtilsateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    recupDeces,
    ajouterDeces,
    supprimerDeces,
    modifierDeces,
    recupDecesByIdUtilsateur
};
//# sourceMappingURL=controllers.js.map