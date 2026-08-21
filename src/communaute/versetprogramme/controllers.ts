import { Request, Response } from 'express';
import services from './services';

// Ce fichier fait le lien entre les routes HTTP (voir routes.ts) et la
// logique metier (services.ts -> functions.ts) : chaque fonction lit la
// requete, appelle le service correspondant, puis renvoie une reponse
// JSON standard { status, data } ou { status: 0, error }.

// Ajoute un verset programme et previent les autres postes connectes
// (evenement socket.io "versetProgrammeModifie") pour qu'ils rafraichissent
// leur liste sans avoir a recharger la page.
const ajouterVersetProgramme = (req: Request, res: Response) => {
  services
    .ajouterVersetProgramme(req.body)
    .then((result: any) => {
      (req as any).io.emit('versetProgrammeModifie', result);
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({
      status: 0,
      error,
      message: error?.message || "Erreur lors de l'ajout du verset.",
    }));
};

// Modifie un verset existant (date, reference ou texte).
const modifierVersetProgramme = (req: Request, res: Response) => {
  services
    .modifierVersetProgramme(req.body)
    .then((result: any) => {
      (req as any).io.emit('versetProgrammeModifie', result);
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({
      status: 0,
      error,
      message: error?.message || 'Erreur lors de la modification du verset.',
    }));
};

// Retire un verset du programme.
const supprimerVersetProgramme = (req: Request, res: Response) => {
  const { idVersetProgramme, idUtilisateur } = req.body;
  services
    .supprimerVersetProgramme(idVersetProgramme, idUtilisateur)
    .then((result: any) => {
      (req as any).io.emit('versetProgrammeModifie', { idUtilisateur });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

// Renvoie tous les versets programmes d'une eglise, tries par date.
const recupVersetsProgrammeByUtilisateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req.params;
  services
    .recupVersetsProgrammeByUtilisateur(Number(idUtilisateur))
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

export default {
  ajouterVersetProgramme,
  modifierVersetProgramme,
  supprimerVersetProgramme,
  recupVersetsProgrammeByUtilisateur,
};
