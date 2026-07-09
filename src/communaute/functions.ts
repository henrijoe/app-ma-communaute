import path from "path";
import { _executeSql } from "../db";
import { _selectSql } from "../db";
import sqliteDB from "../db/sqliteDB";
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

const getMemberPhotosDirectory = (): string => {
  const memberPhotosDir = path.join(sqliteDB.getSqliteDirectory(), 'photo-membre');

  if (!fs.existsSync(memberPhotosDir)) {
    fs.mkdirSync(memberPhotosDir, { recursive: true });
  }

  return memberPhotosDir;
};

const getChurchLogosDirectory = (): string => {
  const churchLogosDir = path.join(sqliteDB.getSqliteDirectory(), 'logo-eglise');

  if (!fs.existsSync(churchLogosDir)) {
    fs.mkdirSync(churchLogosDir, { recursive: true });
  }

  return churchLogosDir;
};

const getGalerieMediaRootDirectory = (): string => {
  const galerieDir = path.join(sqliteDB.getSqliteDirectory(), 'galerie-evenements');

  if (!fs.existsSync(galerieDir)) {
    fs.mkdirSync(galerieDir, { recursive: true });
  }

  return galerieDir;
};

const sanitizeStorageName = (value: string): string => (value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[<>:"/\\|?*\x00-\x1f]/g, ' ')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase();

const getGalerieEventDirectory = (folderName: string): string => {
  const safeFolderName = sanitizeStorageName(folderName) || `evenement-${Date.now()}`;
  const galleryDir = path.join(getGalerieMediaRootDirectory(), safeFolderName);

  if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
  }

  return galleryDir;
};

const getAvatarsPath = (fileNameOrId: string | number): string => {
  const fileName = typeof fileNameOrId === 'number'
    ? `${fileNameOrId}_avatar.jpg`
    : fileNameOrId;

  return path.join(getMemberPhotosDirectory(), fileName);
};

const getChurchLogoPath = (fileNameOrId: string | number): string => {
  const fileName = typeof fileNameOrId === 'number'
    ? `eglise_${fileNameOrId}.jpg`
    : fileNameOrId;

  return path.join(getChurchLogosDirectory(), fileName);
};

// Fonction pour lire un fichier et retourner sa représentation en base64
const getFileToBase64 = (filePath: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const file = filePath;
      if (fs.existsSync(file)) {
        const buffer = fs.readFileSync(file);
        const avatar = buffer.toString('base64');
        resolve(`data:image/${path.extname(file).substring(1)};base64,${avatar}`);
      } else {
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
      const parentDir = path.dirname(file);

      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

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
  getChurchLogoPath,
  getFileToBase64,
  saveFileToBase64,
  getMemberPhotosDirectory,
  getChurchLogosDirectory,
  getGalerieMediaRootDirectory,
  getGalerieEventDirectory,
  sanitizeStorageName,
};
