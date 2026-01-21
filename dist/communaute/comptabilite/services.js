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
const functions_1 = __importDefault(require("./functions"));
/**
 *
Permet d'ajouter une comptabilite
 * @returns
 */
const ajouterComptablilite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const comptabiliteId = yield functions_1.default.ajouterComptablilite(Object.assign({}, data));
            const comptabilite = yield functions_1.default.recupComptabiliteById(comptabiliteId);
            console.log("🚀 ~ file: services.ts:14 ~ returnnewPromise ~ comptabilite:", comptabilite);
            resolve(comptabilite);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const recupComptabilite = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const comptabilites = yield functions_1.default.recupComptabilite();
            resolve(comptabilites);
        }
        catch (error) {
            reject(error);
        }
    }));
};
const supprimerComptabilite = (idComptabilite) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.supprimerComptabilite(idComptabilite);
            resolve({ idCellule: idComptabilite });
        }
        catch (error) {
            reject(error);
        }
    }));
};
const modifierComptabilite = (data) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield functions_1.default.modifierComptabilite(data);
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.default = {
    ajouterComptablilite,
    recupComptabilite,
    supprimerComptabilite,
    modifierComptabilite,
};
//# sourceMappingURL=services.js.map