import { Request, Response } from "express";

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
  getServerNetworkInfo,
};
