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
exports.saveFileToBase64 = exports.getFileToBase64 = exports.getAvatarsPath = exports.errorMsg = exports.msg = exports.isProd = void 0;
const path_1 = __importDefault(require("path"));
// import * as sharp from 'sharp';
require('dotenv').config();
exports.isProd = process.env.NODE_ENV === 'production'
    ? true
    : false;
exports.msg = { name: "ERROR_OCCURED", message: "Une erreur est survenue." };
function hasOnlyProperties(obj, properties) {
    return Object.keys(obj).length === properties.length &&
        properties.every(prop => Object.keys(obj).includes(prop));
}
const errorMsg = (response) => {
    const error = { error: response };
    if (error.hasOwnProperty("error") && hasOnlyProperties(error.error, ['name', 'message']))
        return error.error;
    return (exports.isProd ? exports.msg : error);
};
exports.errorMsg = errorMsg;
const fs = require("fs");
// const sharp = require("sharp");
const _ = require("lodash");
// Old fonction
// const getAvatarsPath = (id: number) => {
//   const avatarsPath = path.join(__dirname, '..', '..', `/albums/avatars/${id}_avatar.jpg`);
//   return avatarsPath;
// }
// functions.ts - version corrigée
const getAvatarsPath = (fileNameOrId) => {
    let fileName;
    // Si c'est un nombre, on génère un nom de fichier basé sur l'ID
    if (typeof fileNameOrId === 'number') {
        fileName = `${fileNameOrId}_avatar.jpg`;
    }
    else {
        // Si c'est déjà une chaîne, on l'utilise directement
        fileName = fileNameOrId;
    }
    const albumsDir = path_1.default.join(__dirname, '..', '..', 'albums');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(albumsDir)) {
        fs.mkdirSync(albumsDir, { recursive: true });
    }
    return path_1.default.join(albumsDir, fileName);
};
exports.getAvatarsPath = getAvatarsPath;
// Fonction pour lire un fichier et retourner sa représentation en base64
const getFileToBase64 = (filePath) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const file = filePath;
            if (fs.existsSync(file)) {
                // Lire le fichier sous forme de buffer
                const buffer = fs.readFileSync(file);
                // Convertir le buffer en base64
                const avatar = buffer.toString('base64');
                // Résoudre la promesse avec une URL de données base64
                resolve(`data:image/${path_1.default.extname(file).substring(1)};base64,${avatar}`);
            }
            else {
                // Si le fichier n'existe pas, résoudre la promesse avec une chaîne vide
                resolve('');
            }
        }
        catch (error) {
            console.log('getFileToBase64.error => ', error.message);
            reject(error);
        }
    }));
};
exports.getFileToBase64 = getFileToBase64;
// Fonction pour enregistrer une chaîne base64 dans un fichier
const saveFileToBase64 = (filePath, fileFromBase64) => {
    if (fileFromBase64 == "")
        return;
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const file = filePath;
            const buffer = Buffer.from(fileFromBase64, "base64");
            // Enregistrer le fichier sans conversion
            fs.writeFileSync(file, buffer);
            resolve(true);
        }
        catch (error) {
            console.log('saveFileToBase64.error => ', error.message);
            reject(error);
        }
    }));
};
exports.saveFileToBase64 = saveFileToBase64;
//# sourceMappingURL=functions.js.map