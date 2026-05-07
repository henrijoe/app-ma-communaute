import { Request, Response } from "express";
import fs from "fs";

import services from "./services";
import { errorMsg } from "../functions";

// Retourne l'etat courant de la licence desktop pour l'utilisateur fourni.
const getDesktopLicenseStatus = async (req: Request, res: Response) => {
  try {
    const nomUtilisateur = String(req.query.nomUtilisateur || "");
    const result = await services.getDesktopLicenseStatus(nomUtilisateur);
    res.status(200).send({ status: 1, data: result });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

// Debloque ou renouvelle l'application desktop a partir d'un compte superadmin.
const unlockDesktopLicense = async (req: Request, res: Response) => {
  try {
    const result = await services.unlockDesktopLicense(req.body);
    res.status(200).send({ status: 1, data: result });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

// Rattache la licence locale a l'ordinateur courant.
const rebindDesktopLicenseMachine = async (req: Request, res: Response) => {
  try {
    const result = await services.rebindDesktopLicenseMachine(req.body);
    res.status(200).send({ status: 1, data: result });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

// Debloque l'application desktop avec un code offline a usage unique.
const unlockDesktopLicenseWithCode = async (req: Request, res: Response) => {
  try {
    const result = await services.unlockDesktopLicenseWithCode(req.body);
    res.status(200).send({ status: 1, data: result });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

// Exporte une seule fois le pack initial de codes genere a la creation de la licence.
const exportPendingDesktopUnlockCodes = async (req: Request, res: Response) => {
  try {
    const result = await services.exportPendingDesktopUnlockCodes(req.body);
    res.status(200).send({ status: 1, data: result });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

// Genere un nouveau pack de codes et remplace les codes non utilises.
const generateDesktopUnlockCodes = async (req: Request, res: Response) => {
  try {
    const result = await services.generateDesktopUnlockCodes(req.body);
    res.status(200).send({ status: 1, data: result });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

// Restaure une sauvegarde SQLite zip fournie par le superadmin.
const restoreSqliteBackup = async (req: Request, res: Response) => {
  const uploadedFile = (req as any).file;

  try {
    if (!uploadedFile?.path) {
      throw new Error("Veuillez selectionner un fichier de sauvegarde .zip.");
    }

    const result = await services.restoreSqliteBackup({
      nomUtilisateur: req.body.nomUtilisateur,
      password: req.body.password,
      backupFilePath: uploadedFile.path,
    });

    res.status(200).send({ status: 1, data: result });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  } finally {
    if (uploadedFile?.path) {
      fs.promises.unlink(uploadedFile.path).catch(() => undefined);
    }
  }
};

// Retourne les informations reseau du serveur pour construire l'URL LAN du navigateur.
const getServerNetworkInfo = (req: Request, res: Response) => {
  try {
    const result = services.getServerNetworkInfo();
    res.status(200).send({ status: 1, data: result });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

export default {
  getDesktopLicenseStatus,
  unlockDesktopLicense,
  rebindDesktopLicenseMachine,
  unlockDesktopLicenseWithCode,
  exportPendingDesktopUnlockCodes,
  generateDesktopUnlockCodes,
  restoreSqliteBackup,
  getServerNetworkInfo,
};
