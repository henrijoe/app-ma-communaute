import { Request, Response } from 'express';
import services from './services';
import { errorMsg } from '../functions';

const ajouterUtilisateur = (req: Request, res: Response) => {
  const data = req.body;
  services
    .ajouterUtilisateur(data)
    .then((result: any) => {
      (req as any).io.emit('ajouterUtilisateur', result);
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const creerBaseSqlite = (req: Request, res: Response) => {
  const data = req.body;
  services
    .creerBaseSqlite(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const recupUtilisateur = (req: Request, res: Response) => {
  services
    .recupUtilisateur()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const recupUtilisateurByParentId = (req: Request, res: Response) => {
  services
    .recupUtilisateurByParentId(Number(req.params.idUtilisateurParent || 0))
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerUtilisateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req.body;
  services
    .supprimerUtilisateur(idUtilisateur)
    .then((result: any) => {
      if (result) {
        (req as any).io.emit('supprimerUtilisateur', result);
        res.status(200).send({ status: 1, data: result });
      } else {
        res.status(400).send({ status: 0, errors: 'Utilisateur non trouve' });
      }
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const modifierUtilisateur = (req: Request, res: Response) => {
  const data = req.body;
  services
    .modifierUtilisateur(data)
    .then((result: any) => {
      (req as any).io.emit('modifierUtilisateur', result);
      res.status(200).send({ status: 1, data: result });
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }));
};

const connexionUtilisateur = async (req: Request, res: Response) => {
  try {
    const { nomUtilisateur, motDePasse } = req.body;
    const utilisateur = await services.connexionUtilisateur(nomUtilisateur, motDePasse);
    res.status(200).send({ status: 1, data: utilisateur });
  } catch (error) {
    console.error(error);
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await services.login(data);
    res.status(200).send({ status: 1, data: result });
  } catch (error) {
    console.error(error);
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

export default {
  ajouterUtilisateur,
  creerBaseSqlite,
  recupUtilisateur,
  recupUtilisateurByParentId,
  supprimerUtilisateur,
  modifierUtilisateur,
  connexionUtilisateur,
  login,
};
