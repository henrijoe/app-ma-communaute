import path from "path";
import { _executeSql } from "../db";
import { _selectSql } from "../db";
// import * as sharp from 'sharp';
require('dotenv').config();




export const isProd: boolean =process.env.NODE_ENV === 'production'
    ? true
    : false;    


export const msg= { name: "ERROR_OCCURED", message: "Une erreur est survenue." };

function hasOnlyProperties(obj, properties) {
  return Object.keys(obj).length === properties.length &&
    properties.every(prop => Object.keys(obj).includes(prop));
}

export const errorMsg=(response:any)=>{
    const error={error:response}
    if (error.hasOwnProperty("error") && hasOnlyProperties(error.error, ['name', 'message'])) return error.error;
    return (isProd ? msg : error)
}

const fs = require("fs");
// const sharp = require("sharp");
const _ = require("lodash");



// Old fonction
// const getAvatarsPath = (id: number) => {
//   const avatarsPath = path.join(__dirname, '..', '..', `/albums/avatars/${id}_avatar.jpg`);
//   return avatarsPath;
// }

// functions.ts - version corrigée
 const getAvatarsPath = (fileNameOrId: string | number): string => {
  let fileName: string;
  
  // Si c'est un nombre, on génère un nom de fichier basé sur l'ID
  if (typeof fileNameOrId === 'number') {
    fileName = `${fileNameOrId}_avatar.jpg`;
  } else {
    // Si c'est déjà une chaîne, on l'utilise directement
    fileName = fileNameOrId;
  }
  
  const albumsDir = path.join(__dirname, '..', '..', 'albums');
  
  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(albumsDir)) {
    fs.mkdirSync(albumsDir, { recursive: true });
  }
  
  return path.join(albumsDir, fileName);
};


// Fonction pour lire un fichier et retourner sa représentation en base64
const getFileToBase64 = (filePath: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const file = filePath;
      if (fs.existsSync(file)) {
        // Lire le fichier sous forme de buffer
        const buffer = fs.readFileSync(file);
        // Convertir le buffer en base64
        const avatar = buffer.toString('base64');
        // Résoudre la promesse avec une URL de données base64
        resolve(`data:image/${path.extname(file).substring(1)};base64,${avatar}`);
      } else {
        // Si le fichier n'existe pas, résoudre la promesse avec une chaîne vide
        resolve('');
      }
    } catch (error:any) {
      console.log('getFileToBase64.error => ', error.message)
      reject(error)
    }
  });
};

// Fonction pour enregistrer une chaîne base64 dans un fichier
const saveFileToBase64 = (filePath: string, fileFromBase64: string) => {
  if (fileFromBase64 == "") return;
  return new Promise(async (resolve, reject) => {
    try {
      const file = filePath;
      const buffer = Buffer.from(fileFromBase64, "base64");

      // Enregistrer le fichier sans conversion
      fs.writeFileSync(file, buffer);

      resolve(true);
    } catch (error:any) {
      console.log('saveFileToBase64.error => ', error.message)
      reject(error)
    }
  });
};


export {
  getAvatarsPath,
  getFileToBase64,
  saveFileToBase64,
};

