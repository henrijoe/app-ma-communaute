import { Request, Response } from "express";
import services from "./services";

const ajouterMaladie = (req: Request, res: Response) => {
  const data = req.body;
  services
    .ajouterMaladie(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => {
      if (error?.message?.includes('Ce cas de maladie existe deja.')) {
        res.status(400).send({ status: 0, error: error.message });
      } else {
        res.status(400).send({ status: 0, error });
      }
    });
};

const recupMaladie = (req: Request, res: Response) => {
  services
    .recupMaladie()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerMaladie = (req: Request, res: Response) => {
  const { idMaladie } = req.body;
  services
    .supprimerMaladie(idMaladie)
    .then((result: any) => {
      if (result) {
        res.status(200).send({ status: 1, data: result });
      } else {
        res.status(400).send({ status: 0, errors: 'Maladie non trouvee' });
      }
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const modifierMaladie = (req: Request, res: Response) => {
  const data = req.body;
  services
    .modifierMaladie(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const recupMaladieByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req.params;
  services
    .recupMaladieByIdUtilsateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

export default {
  ajouterMaladie,
  recupMaladie,
  supprimerMaladie,
  modifierMaladie,
  recupMaladieByIdUtilsateur,
};
