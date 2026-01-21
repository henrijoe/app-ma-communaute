"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterCulte = (req, res) => {
    const data = req.body;
    // console.log("🚀 ~ ajouterCulte ~ data:", data)
    const io = req.io;
    services_1.default
        .ajouterCulte(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => {
        if (error.message.includes('Ce culte existe déjà.')) {
            res.status(400).send({ status: 0, error: error.message });
        }
        else {
            res.status(400).send({ status: 0, error });
        }
    });
};
/**
 * Récupérer une cellule
 * @returns
 */
const recupCulte = (req, res) => {
    services_1.default
        .recupCulte()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerCulte = (req, res) => {
    const { idCulte } = req.body;
    services_1.default
        .supprimerCulte(idCulte)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Culte non trouvée' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierCulte = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierCulte(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const recupCulteByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req === null || req === void 0 ? void 0 : req.params;
    services_1.default
        .recupCulteByIdUtilsateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    recupCulte,
    ajouterCulte,
    supprimerCulte,
    modifierCulte,
    recupCulteByIdUtilsateur
};
//# sourceMappingURL=controllers.js.map