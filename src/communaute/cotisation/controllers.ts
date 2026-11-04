import { Request, Response } from "express";

import { errorMsg } from "../functions";
import services from "./services";

const repondre = async (res: Response, action: () => Promise<unknown>) => {
  try {
    res.status(200).send({ status: 1, data: await action() });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

const recupCotisations = (req: Request, res: Response) =>
  repondre(res, () => services.recupCotisations(Number(req.params.idUtilisateur)));
const ajouterCotisation = (req: Request, res: Response) =>
  repondre(res, () => services.ajouterCotisation(req.body));
const modifierCotisation = (req: Request, res: Response) =>
  repondre(res, () => services.modifierCotisation(req.body));
const supprimerCotisation = (req: Request, res: Response) =>
  repondre(res, () => services.supprimerCotisation(req.body));

export default {
  recupCotisations,
  ajouterCotisation,
  modifierCotisation,
  supprimerCotisation,
};
