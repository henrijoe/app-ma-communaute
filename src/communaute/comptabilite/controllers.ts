import { Request, Response } from 'express';
import services from './services';

const ajouterComptablilite = (req: Request, res: Response) => {
  const data = req.body;

  services
    .ajouterComptablilite(data)
    .then((result: any) => {
      const firstRow = Array.isArray(result) ? result[0] : result;
      (req as any).io.emit('ajouterComptabilite', {
        idUtilisateur: Number(firstRow?.idUtilisateur || data?.idUtilisateur || 0) || null,
        idComptabilite: Number(firstRow?.idComptabilite || 0) || null,
        nomComptabilite: firstRow?.nomComptabilite || data?.nomComptabilite || '',
        data: result,
      });
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

const recupComptabiliteSupprimee = (req: Request, res: Response) => {
  const idUtilisateur = Number(req.params.idUtilisateur || req.query.idUtilisateur || 0);

  services
    .recupComptabiliteSupprimeeByUtilisateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const supprimerComptabilite = (req: Request, res: Response) => {
  const idComptabilite = Number(req.body?.idComptabilite || req.params.id);
  const supprimeParUtilisateur = Number(req.body?.idUtilisateur || 0) || null;
  const motifSuppressionComptabilite = req.body?.motifSuppressionComptabilite || null;

  services
    .supprimerComptabilite(idComptabilite, supprimeParUtilisateur, motifSuppressionComptabilite)
    .then((result: any) => {
      (req as any).io.emit('supprimerComptabilite', result);
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const restaurerComptabilite = (req: Request, res: Response) => {
  const idComptabilite = Number(req.body?.idComptabilite || req.params.id);

  services
    .restaurerComptabilite(idComptabilite)
    .then((result: any) => {
      (req as any).io.emit('restaurerComptabilite', result);
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const supprimerComptabiliteDefinitivement = (req: Request, res: Response) => {
  const idComptabilite = Number(req.body?.idComptabilite || req.params.id);
  const nomUtilisateur = req.body?.nomUtilisateur || req.query?.nomUtilisateur || '';

  services
    .supprimerComptabiliteDefinitivement(idComptabilite, nomUtilisateur)
    .then((result: any) => {
      (req as any).io.emit('supprimerComptabiliteDefinitivement', result);
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
      const firstRow = Array.isArray(result) ? result[0] : result;
      (req as any).io.emit('modifierComptabilite', {
        idUtilisateur: Number(firstRow?.idUtilisateur || data?.idUtilisateur || 0) || null,
        idComptabilite: Number(firstRow?.idComptabilite || data?.idComptabilite || 0) || null,
        nomComptabilite: firstRow?.nomComptabilite || data?.nomComptabilite || '',
        data: result,
      });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

export default {
  ajouterComptablilite,
  recupComptabilite,
  recupComptabiliteSupprimee,
  supprimerComptabilite,
  restaurerComptabilite,
  supprimerComptabiliteDefinitivement,
  modifierComptabilite,
};
