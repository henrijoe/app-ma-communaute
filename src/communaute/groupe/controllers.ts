import { Request, Response } from "express";
import services from "./services";

const ajouterGroupe = (req: Request, res: Response) => {
  const data = req.body;

  services
    .ajouterGroupe(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const recupGroupe = (req: Request, res: Response) => {
  services
    .recupGroupe()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const recupGroupeByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req.params;

  services
    .recupGroupeByIdUtilsateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerGroupe = (req: Request, res: Response) => {
  const { idGroupe, idUtilisateur } = req.body;

  services
    .supprimerGroupe(idGroupe, idUtilisateur)
    .then((result: any) => {
      if (result) {
        res.status(200).send({ status: 1, data: result });
      } else {
        res.status(400).send({ status: 0, errors: "Groupe non trouve" });
      }
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const modifierGroupe = (req: Request, res: Response) => {
  const data = req.body;

  services
    .modifierGroupe(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

export default {
  ajouterGroupe,
  recupGroupe,
  supprimerGroupe,
  modifierGroupe,
  recupGroupeByIdUtilsateur,
};
