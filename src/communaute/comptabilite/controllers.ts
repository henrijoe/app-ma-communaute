import { Request, Response } from 'express';
import services from './services';

const ajouterComptablilite = (req: Request, res: Response) => {
  const data = req.body;

  services
    .ajouterComptablilite(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const recupComptabilite = (req: Request, res: Response) => {
  const idUtilisateur = Number(req.params.idUtilisateur || req.query.idUtilisateur || 0);
  const serviceCall = idUtilisateur > 0
    ? services.recupComptabiliteByUtilisateur(idUtilisateur)
    : services.recupComptabilite();

  serviceCall
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const supprimerComptabilite = (req: Request, res: Response) => {
  const idComptabilite = Number(req.body?.idComptabilite || req.params.id);

  services
    .supprimerComptabilite(idComptabilite)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const modifierComptabilite = (req: Request, res: Response) => {
  const data = {
    ...req.body,
    idComptabilite: Number(req.body?.idComptabilite || req.params.id),
  };

  services
    .modifierComptabilite(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

export default {
  ajouterComptablilite,
  recupComptabilite,
  supprimerComptabilite,
  modifierComptabilite,
};