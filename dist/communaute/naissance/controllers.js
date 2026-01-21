"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = __importDefault(require("./services"));
const ajouterNaissance = (req, res) => {
    const data = req.body;
    console.log("🚀 ~ ajouterNaissance ~ data:", data);
    const io = req.io;
    services_1.default
        .ajouterNaissance(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => {
        if (error.message.includes('Ce cas de naissance à déjà ètè enregistré.')) {
            res.status(400).send({ status: 0, error: error.message });
        }
        else {
            res.status(400).send({ status: 0, error });
        }
    });
};
/**
 * Récupérer une naissance
 * @returns
 */
const recupNaissance = (req, res) => {
    services_1.default
        .recupNaissance()
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
const supprimerNaissance = (req, res) => {
    const { idNaissance } = req.body;
    services_1.default
        .supprimerNaissance(idNaissance)
        .then((result) => {
        if (result) {
            res.status(200).send({ status: 1, data: result });
        }
        else {
            res.status(400).send({ status: 0, errors: 'Naissance non trouvée' });
        }
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const modifierNaissance = (req, res) => {
    const data = req.body;
    services_1.default
        .modifierNaissance(data)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((errors) => res.status(400).send({ status: 0, errors }));
};
const recupNaissanceByIdUtilsateur = (req, res) => {
    const { idUtilisateur } = req === null || req === void 0 ? void 0 : req.params;
    services_1.default
        .recupNaissanceByIdUtilsateur(idUtilisateur)
        .then((result) => {
        res.status(200).send({ status: 1, data: result });
    })
        .catch((error) => res.status(400).send({ status: 0, error }));
};
exports.default = {
    recupNaissance,
    ajouterNaissance,
    supprimerNaissance,
    modifierNaissance,
    recupNaissanceByIdUtilsateur
};
//# sourceMappingURL=controllers.js.map