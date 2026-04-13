import fs from "fs";
import os from "os";
import path from "path";
const AdmZip = require("adm-zip");

import { _executeSql, _selectSql } from "../../db";
import {
  getGalerieEventDirectory,
  getGalerieMediaRootDirectory,
  sanitizeStorageName,
  saveFileToBase64,
} from "../functions";
import { IGalerieEvenement, IGalerieImage, IGalerieImagePayload } from "./interfaces";

const buildEventFolderName = (idGalerie: number, titreGalerie: string, dateEvenement?: string | null): string => {
  const safeTitle = sanitizeStorageName(titreGalerie || `evenement-${idGalerie}`);
  const safeDate = sanitizeStorageName(dateEvenement || new Date().toISOString().slice(0, 10));
  return `${idGalerie}-${safeDate}-${safeTitle}`;
};

const ensureSafeGalleryPath = (candidatePath: string): string => {
  const rootPath = path.resolve(getGalerieMediaRootDirectory());
  const resolvedPath = path.resolve(candidatePath);

  if (!resolvedPath.startsWith(rootPath)) {
    throw new Error("Chemin galerie invalide.");
  }

  return resolvedPath;
};

const getGalerieById = async (idGalerie: number): Promise<IGalerieEvenement | null> => {
  const sql = `
    SELECT g.*, COUNT(gi.idGalerieImage) AS nombreImages
    FROM galerie g
    LEFT JOIN galerie_image gi ON gi.idGalerie = g.idGalerie
    WHERE g.idGalerie = ?
    GROUP BY g.idGalerie
  `;
  const result: any[] = await _selectSql(sql, [idGalerie]);
  return result.length > 0 ? result[0] : null;
};

const getGalerieImageById = async (idGalerieImage: number): Promise<IGalerieImage | null> => {
  const sql = `SELECT * FROM galerie_image WHERE idGalerieImage = ?`;
  const result: any[] = await _selectSql(sql, [idGalerieImage]);
  return result.length > 0 ? result[0] : null;
};

const ajouterGalerie = async (data: IGalerieEvenement): Promise<IGalerieEvenement> => {
  const values = [
    data.titreGalerie,
    data.typeEvenement,
    data.dateEvenement || null,
    data.lieuEvenement || "",
    data.descriptionGalerie || "",
    "",
    "",
    data.idUtilisateur,
  ];

  const sql = `
    INSERT INTO galerie(
      titreGalerie,
      typeEvenement,
      dateEvenement,
      lieuEvenement,
      descriptionGalerie,
      couvertureGalerie,
      dossierGalerie,
      idUtilisateur
    ) VALUES (?,?,?,?,?,?,?,?)
  `;

  const inserted: any = await _executeSql(sql, values);
  const idGalerie = Number(inserted.insertId);
  const dossierGalerie = buildEventFolderName(idGalerie, data.titreGalerie, data.dateEvenement);

  await _executeSql(`UPDATE galerie SET dossierGalerie = ? WHERE idGalerie = ?`, [dossierGalerie, idGalerie]);
  getGalerieEventDirectory(dossierGalerie);

  const galerie = await getGalerieById(idGalerie);
  if (!galerie) {
    throw new Error("Galerie introuvable apres creation.");
  }

  return galerie;
};

const recupGaleriesByUtilisateur = async (idUtilisateur: number): Promise<IGalerieEvenement[]> => {
  const sql = `
    SELECT g.*, COUNT(gi.idGalerieImage) AS nombreImages
    FROM galerie g
    LEFT JOIN galerie_image gi ON gi.idGalerie = g.idGalerie
    WHERE g.idUtilisateur = ?
    GROUP BY g.idGalerie
    ORDER BY COALESCE(g.dateEvenement, g.dateCreation) DESC, g.idGalerie DESC
  `;

  const result = await _selectSql(sql, [idUtilisateur]);
  return Array.isArray(result) ? result : [];
};

const modifierGalerie = async (data: IGalerieEvenement): Promise<boolean> => {
  const sql = `
    UPDATE galerie
    SET titreGalerie = ?, typeEvenement = ?, dateEvenement = ?, lieuEvenement = ?, descriptionGalerie = ?, idUtilisateur = ?
    WHERE idGalerie = ?
  `;

  await _executeSql(sql, [
    data.titreGalerie,
    data.typeEvenement,
    data.dateEvenement || null,
    data.lieuEvenement || "",
    data.descriptionGalerie || "",
    data.idUtilisateur,
    data.idGalerie,
  ]);

  return true;
};

const recupImagesGalerie = async (idGalerie: number): Promise<IGalerieImage[]> => {
  const sql = `SELECT * FROM galerie_image WHERE idGalerie = ? ORDER BY idGalerieImage DESC`;
  const result = await _selectSql(sql, [idGalerie]);
  return Array.isArray(result) ? result : [];
};

const ajouterImagesGalerie = async (payload: {
  idGalerie: number;
  idUtilisateur: number;
  images: IGalerieImagePayload[];
}): Promise<IGalerieImage[]> => {
  const galerie = await getGalerieById(payload.idGalerie);
  if (!galerie) {
    throw new Error("Evenement galerie introuvable.");
  }

  const dossierGalerie = galerie.dossierGalerie || buildEventFolderName(payload.idGalerie, galerie.titreGalerie, galerie.dateEvenement);
  if (!galerie.dossierGalerie) {
    await _executeSql(`UPDATE galerie SET dossierGalerie = ? WHERE idGalerie = ?`, [dossierGalerie, payload.idGalerie]);
  }

  const eventDir = getGalerieEventDirectory(dossierGalerie);
  const insertedImages: IGalerieImage[] = [];

  for (let index = 0; index < payload.images.length; index += 1) {
    const image = payload.images[index];
    const extension = (image.typeMime || "image/jpeg").split("/")[1] || "jpg";
    const safeBaseName = sanitizeStorageName(path.parse(image.nomOriginal || `image-${index + 1}`).name) || `image-${index + 1}`;
    const nomFichier = `${Date.now()}-${index + 1}-${safeBaseName}.${extension}`;
    const cheminImage = `${dossierGalerie}/${nomFichier}`.replace(/\\/g, "/");
    const filePath = ensureSafeGalleryPath(path.join(eventDir, nomFichier));
    const base64Data = image.base64.replace(/^data:image\/\w+;base64,/, "");

    await saveFileToBase64(filePath, base64Data);

    const insertSql = `
      INSERT INTO galerie_image(
        idGalerie,
        nomFichier,
        cheminImage,
        tailleImage,
        typeMime,
        legendeImage,
        idUtilisateur
      ) VALUES (?,?,?,?,?,?,?)
    `;

    const inserted: any = await _executeSql(insertSql, [
      payload.idGalerie,
      nomFichier,
      cheminImage,
      null,
      image.typeMime || "image/jpeg",
      image.legendeImage || "",
      payload.idUtilisateur,
    ]);

    const currentImage = await getGalerieImageById(Number(inserted.insertId));
    if (currentImage) {
      insertedImages.push(currentImage);
    }
  }

  if (!galerie.couvertureGalerie && insertedImages.length > 0) {
    await _executeSql(`UPDATE galerie SET couvertureGalerie = ? WHERE idGalerie = ?`, [insertedImages[0].cheminImage, payload.idGalerie]);
  }

  return insertedImages;
};

const modifierImageGalerie = async (payload: { idGalerieImage: number; legendeImage: string; idUtilisateur?: number }): Promise<IGalerieImage> => {
  const image = await getGalerieImageById(payload.idGalerieImage);
  if (!image) {
    throw new Error("Image galerie introuvable.");
  }

  if (typeof payload.idUtilisateur === "number" && Number(image.idUtilisateur) !== Number(payload.idUtilisateur)) {
    throw new Error("Modification non autorisee pour cette image.");
  }

  await _executeSql(`UPDATE galerie_image SET legendeImage = ? WHERE idGalerieImage = ?`, [payload.legendeImage || "", payload.idGalerieImage]);
  const updated = await getGalerieImageById(payload.idGalerieImage);

  if (!updated) {
    throw new Error("Image galerie introuvable apres modification.");
  }

  return updated;
};

const definirCouvertureGalerie = async (payload: { idGalerie: number; idGalerieImage: number; idUtilisateur?: number }): Promise<boolean> => {
  const galerie = await getGalerieById(payload.idGalerie);
  if (!galerie) {
    throw new Error("Evenement galerie introuvable.");
  }

  if (typeof payload.idUtilisateur === "number" && Number(galerie.idUtilisateur) !== Number(payload.idUtilisateur)) {
    throw new Error("Modification non autorisee pour cette galerie.");
  }

  const image = await getGalerieImageById(payload.idGalerieImage);
  if (!image || Number(image.idGalerie) !== Number(payload.idGalerie)) {
    throw new Error("Image de couverture introuvable pour cet evenement.");
  }

  await _executeSql(`UPDATE galerie SET couvertureGalerie = ? WHERE idGalerie = ?`, [image.cheminImage, payload.idGalerie]);
  return true;
};

const supprimerImageGalerie = async (idGalerieImage: number, idUtilisateur?: number): Promise<boolean> => {
  const image = await getGalerieImageById(idGalerieImage);
  if (!image) {
    return false;
  }

  const galerie = await getGalerieById(image.idGalerie);
  if (!galerie) {
    throw new Error("Evenement galerie introuvable.");
  }

  if (typeof idUtilisateur === "number" && Number(galerie.idUtilisateur) !== Number(idUtilisateur)) {
    throw new Error("Suppression non autorisee pour cette image.");
  }

  const absolutePath = ensureSafeGalleryPath(path.join(getGalerieMediaRootDirectory(), image.cheminImage));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }

  await _executeSql(`DELETE FROM galerie_image WHERE idGalerieImage = ?`, [idGalerieImage]);

  if (galerie.couvertureGalerie === image.cheminImage) {
    const remainingImages = await recupImagesGalerie(image.idGalerie);
    const nextCover = remainingImages.length > 0 ? remainingImages[0].cheminImage : "";
    await _executeSql(`UPDATE galerie SET couvertureGalerie = ? WHERE idGalerie = ?`, [nextCover, image.idGalerie]);
  }

  return true;
};

const buildGalerieZip = async (idGalerie: number, idUtilisateur?: number): Promise<{ filePath: string; fileName: string }> => {
  const galerie = await getGalerieById(idGalerie);
  if (!galerie) {
    throw new Error("Evenement galerie introuvable.");
  }

  if (typeof idUtilisateur === "number" && Number(galerie.idUtilisateur) !== Number(idUtilisateur)) {
    throw new Error("Telechargement non autorise pour cet evenement.");
  }

  const eventDir = ensureSafeGalleryPath(getGalerieEventDirectory(galerie.dossierGalerie));
  const zip = new AdmZip();

  if (fs.existsSync(eventDir)) {
    zip.addLocalFolder(eventDir, galerie.dossierGalerie);
  }

  const fileName = `${sanitizeStorageName(galerie.titreGalerie || galerie.dossierGalerie || `galerie-${idGalerie}`)}.zip`;
  const filePath = path.join(os.tmpdir(), `${Date.now()}-${fileName}`);
  zip.writeZip(filePath);

  return { filePath, fileName };
};

const supprimerGalerie = async (idGalerie: number, idUtilisateur?: number): Promise<boolean> => {
  const galerie = await getGalerieById(idGalerie);
  if (!galerie) {
    return false;
  }

  if (typeof idUtilisateur === "number" && Number(galerie.idUtilisateur) !== Number(idUtilisateur)) {
    throw new Error("Suppression non autorisee pour cet evenement.");
  }

  const eventDir = ensureSafeGalleryPath(getGalerieEventDirectory(galerie.dossierGalerie));
  if (fs.existsSync(eventDir)) {
    fs.rmSync(eventDir, { force: true, recursive: true });
  }

  await _executeSql(`DELETE FROM galerie_image WHERE idGalerie = ?`, [idGalerie]);
  await _executeSql(`DELETE FROM galerie WHERE idGalerie = ?`, [idGalerie]);

  return true;
};

export default {
  ajouterGalerie,
  ajouterImagesGalerie,
  buildGalerieZip,
  definirCouvertureGalerie,
  getGalerieById,
  modifierGalerie,
  modifierImageGalerie,
  recupGaleriesByUtilisateur,
  recupImagesGalerie,
  supprimerGalerie,
  supprimerImageGalerie,
};
