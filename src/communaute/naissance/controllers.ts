import { Request, Response } from "express";
import services from "./services";

const ajouterNaissance = (req: Request, res: Response) => {
  const data = req.body;

  services
    .ajouterNaissance(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const recupNaissance = (req: Request, res: Response) => {
  services
    .recupNaissance()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerNaissance = (req: Request, res: Response) => {
  const { idNaissance, idUtilisateur } = req.body;

  services
    .supprimerNaissance(idNaissance, idUtilisateur)
    .then((result: any) => {
      if (result) {
        res.status(200).send({ status: 1, data: result });
      } else {
        res.status(400).send({ status: 0, errors: "Naissance non trouvee" });
      }
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const modifierNaissance = (req: Request, res: Response) => {
  const data = req.body;

  services
    .modifierNaissance(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const recupNaissanceByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req.params;

  services
    .recupNaissanceByIdUtilsateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

export default {
  recupNaissance,
  ajouterNaissance,
  supprimerNaissance,
  modifierNaissance,
  recupNaissanceByIdUtilsateur,
};
