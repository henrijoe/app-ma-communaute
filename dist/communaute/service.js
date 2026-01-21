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
const functions_1 = __importDefault(require("./membre/functions"));
const functions_2 = __importDefault(require("./cellule/functions"));
const functions_3 = __importDefault(require("./groupe/functions"));
const functions_4 = __importDefault(require("./comptabilite/functions"));
const functions_5 = __importDefault(require("./departement/functions"));
const functions_6 = __importDefault(require("./nouvelle_ame/functions"));
const functions_7 = __importDefault(require("./utlisateur/functions"));
// La fonction prend l'id d'un utilisateur en paramètre et retourne une Promise
const getDataEglise = (idUtilisateur) => {
    // La fonction retourne une nouvelle Promise avec les fonctions resolve et reject
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Récupération des données de l'utilisateur à partir d'une fonction externe
            const utilisateur = yield functions_7.default.recupUtilisateurById(idUtilisateur);
            // Récupération des données de membres, nouvelles âmes, cellules, groupes, départements et comptabilités
            const membres = yield functions_1.default.recupMembre();
            const nouvelle_ame = yield functions_6.default.recupNouvelleAme();
            const cellules = yield functions_2.default.recupCellule();
            const groupes = yield functions_3.default.recupGroupe();
            const departements = yield functions_5.default.recupDepartement();
            const comptabilites = yield functions_4.default.recupComptabilite();
            // Filtrage des données en fonction de l'id de l'utilisateur
            const newMembre = membres.filter((item) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newAme = nouvelle_ame.filter((item) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newCellule = cellules.filter((item) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newGroupe = groupes.filter((item) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newComptabilite = comptabilites.filter((item) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newDepartement = departements.filter((item) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            // Création d'un objet résultat contenant les données filtrées
            const result = {
                idUtilisateur: utilisateur[0].idUtilisateur,
                nomTemple: utilisateur[0].nomTemple,
                nomUtilisateur: utilisateur[0].nomUtilisateur,
                prenomUtilisateur: utilisateur[0].prenomUtilisateur,
                telephoneUtilisateur: utilisateur[0].telephoneUtilisateur,
                password: utilisateur[0].password,
                confirmPassword: utilisateur[0].confirmPassword,
                email: utilisateur[0].email,
                Membres: newMembre,
                nouvelleAmes: newAme,
                Cellules: newCellule,
                Groupes: newGroupe,
                Departements: newDepartement,
                Comptabilites: newComptabilite,
            };
            // Résolution de la Promise avec l'objet résultat
            resolve(result);
        }
        catch (error) {
            // Rejet de la Promise en cas d'erreur
            reject(error);
        }
    }));
};
exports.default = {
    getDataEglise
};
//# sourceMappingURL=service.js.map