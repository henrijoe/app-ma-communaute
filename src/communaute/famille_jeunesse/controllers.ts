import { Request, Response } from "express";
import services from "./services";

const ajouterFamilleJeunesse = (req: Request, res: Response) => {
  services
    .ajouterFamilleJeunesse(req.body)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const recupFamilleJeunesse = (req: Request, res: Response) => {
  services
    .recupFamilleJeunesse()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const recupFamilleJeunesseByIdUtilisateur = (req: Request, res: Response) => {
  services
    .recupFamilleJeunesseByIdUtilisateur(req.params.idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerFamilleJeunesse = (req: Request, res: Response) => {
  const { idFamilleJeunesse, idUtilisateur } = req.body;

  services
    .supprimerFamilleJeunesse(idFamilleJeunesse, idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const modifierFamilleJeunesse = (req: Request, res: Response) => {
  services
    .modifierFamilleJeunesse(req.body)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

export default {
  ajouterFamilleJeunesse,
  modifierFamilleJeunesse,
  recupFamilleJeunesse,
  recupFamilleJeunesseByIdUtilisateur,
  supprimerFamilleJeunesse,
};
