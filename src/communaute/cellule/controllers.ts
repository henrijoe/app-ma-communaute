import { Request, Response } from "express";
import services from "./services";

const ajouterCellule = (req: Request, res: Response) => {
  const data = req.body;

  services
    .ajouterCellule(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => {
      if (error.message?.includes("Cette cellule existe deja.")) {
        res.status(400).send({ status: 0, error: error.message });
      } else {
        res.status(400).send({ status: 0, error });
      }
    });
};

const recupCellule = (req: Request, res: Response) => {
  services
    .recupCellule()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerCellule = (req: Request, res: Response) => {
  const { idCellule, idUtilisateur } = req.body;

  services
    .supprimerCellule(idCellule, idUtilisateur)
    .then((result: any) => {
      if (result) {
        res.status(200).send({ status: 1, data: result });
      } else {
        res.status(400).send({ status: 0, errors: "Cellule non trouvee" });
      }
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const modifierCellule = (req: Request, res: Response) => {
  const data = req.body;

  services
    .modifierCellule(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const recupCelluleByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req.params;

  services
    .recupCelluleByIdUtilsateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

export default {
  recupCellule,
  ajouterCellule,
  supprimerCellule,
  modifierCellule,
  recupCelluleByIdUtilsateur,
};
