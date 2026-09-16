import { Request, Response } from 'express';
import services from './services';

// Ce fichier fait le lien entre les routes HTTP (voir routes.ts) et la
// logique métier (services.ts -> functions.ts) : chaque fonction lit la
// requête, appelle le service correspondant, puis renvoie une réponse
// JSON standard { status, data } ou { status: 0, error }.

// Ajoute une ligne de programme et prévient les autres postes connectés
// (événement socket.io "programmeEgliseModifie") pour qu'ils rafraîchissent
// leur liste sans avoir a recharger la page.
const ajouterProgrammeEglise = (req: Request, res: Response) => {
  services
    .ajouterProgrammeEglise(req.body)
    .then((result: any) => {
      (req as any).io.emit('programmeEgliseModifie', result);
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({
      status: 0,
      error,
      message: error?.message || "Erreur lors de l'ajout du programme.",
    }));
};

// Modifie une ligne de programme existante.
const modifierProgrammeEglise = (req: Request, res: Response) => {
  services
    .modifierProgrammeEglise(req.body)
    .then((result: any) => {
      (req as any).io.emit('programmeEgliseModifie', result);
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({
      status: 0,
      error,
      message: error?.message || 'Erreur lors de la modification du programme.',
    }));
};

// Retire une ligne du programme.
const supprimerProgrammeEglise = (req: Request, res: Response) => {
  const { idProgramme, idUtilisateur } = req.body;
  services
    .supprimerProgrammeEglise(idProgramme, idUtilisateur)
    .then((result: any) => {
      (req as any).io.emit('programmeEgliseModifie', { idUtilisateur });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

// Renvoie tout le programme d'une église, trie par date.
const recupProgrammesEgliseByUtilisateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req.params;
  services
    .recupProgrammesEgliseByUtilisateur(Number(idUtilisateur))
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

export default {
  ajouterProgrammeEglise,
  modifierProgrammeEglise,
  supprimerProgrammeEglise,
  recupProgrammesEgliseByUtilisateur,
};
