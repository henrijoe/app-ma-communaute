import { Request, Response } from "express";

import { errorMsg } from "../functions";
import functions from "./functions";

// Les écritures préviennent les autres postes connectés, comme les autres modules.
const diffuser = (req: Request, evenement: string, charge: any) => {
  (req as any).io?.emit(evenement, charge);
};

const repondre = (res: Response, promesse: Promise<any>) =>
  promesse
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));

// ----------------------------------------------------------------- classes

const recupClassesByUtilisateur = (req: Request, res: Response) =>
  repondre(res, functions.recupClasses(Number(req.params.idUtilisateur)));

const ajouterClasse = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .ajouterClasse(data)
    .then((result: any) => {
      diffuser(req, "ajouterClasseEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const modifierClasse = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .modifierClasse(data)
    .then((result: any) => {
      diffuser(req, "modifierClasseEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const supprimerClasse = (req: Request, res: Response) => {
  const { idClasseEcodim, idUtilisateur } = req.body;

  return functions
    .supprimerClasse(Number(idClasseEcodim), Number(idUtilisateur))
    .then((result: any) => {
      diffuser(req, "supprimerClasseEcodim", { idUtilisateur, idClasseEcodim });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

// --------------------------------------------------------------- moniteurs

const recupMoniteursByUtilisateur = (req: Request, res: Response) =>
  repondre(res, functions.recupMoniteurs(Number(req.params.idUtilisateur)));

const ajouterMoniteur = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .ajouterMoniteur(data)
    .then((result: any) => {
      diffuser(req, "ajouterMoniteurEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const modifierMoniteur = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .modifierMoniteur(data)
    .then((result: any) => {
      diffuser(req, "modifierMoniteurEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const supprimerMoniteur = (req: Request, res: Response) => {
  const { idMoniteur, idUtilisateur } = req.body;

  return functions
    .supprimerMoniteur(Number(idMoniteur), Number(idUtilisateur))
    .then((result: any) => {
      diffuser(req, "supprimerMoniteurEcodim", { idUtilisateur, idMoniteur });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

// ----------------------------------------------------------------- enfants

const recupEnfantsByUtilisateur = (req: Request, res: Response) =>
  repondre(res, functions.recupEnfants(Number(req.params.idUtilisateur)));

const ajouterEnfant = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .ajouterEnfant(data)
    .then((result: any) => {
      diffuser(req, "ajouterEnfantEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const modifierEnfant = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .modifierEnfant(data)
    .then((result: any) => {
      diffuser(req, "modifierEnfantEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const supprimerEnfant = (req: Request, res: Response) => {
  const { idEnfantEcodim, idUtilisateur } = req.body;

  return functions
    .supprimerEnfant(Number(idEnfantEcodim), Number(idUtilisateur))
    .then((result: any) => {
      diffuser(req, "supprimerEnfantEcodim", { idUtilisateur, idEnfantEcodim });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

// --------------------------------------------------------------- activités

const recupActivitesByUtilisateur = (req: Request, res: Response) =>
  repondre(res, functions.recupActivites(Number(req.params.idUtilisateur)));

const ajouterActivite = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .ajouterActivite(data)
    .then((result: any) => {
      diffuser(req, "ajouterActiviteEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const modifierActivite = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .modifierActivite(data)
    .then((result: any) => {
      diffuser(req, "modifierActiviteEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const supprimerActivite = (req: Request, res: Response) => {
  const { idActiviteEcodim, idUtilisateur } = req.body;

  return functions
    .supprimerActivite(Number(idActiviteEcodim), Number(idUtilisateur))
    .then((result: any) => {
      diffuser(req, "supprimerActiviteEcodim", { idUtilisateur, idActiviteEcodim });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

// ------------------------------------------------------------------ médias

const enregistrerPhotoEnfant = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .enregistrerPhotoEnfant({
      idEnfantEcodim: Number(data?.idEnfantEcodim),
      idUtilisateur: Number(data?.idUtilisateur),
      photo: String(data?.photo || ""),
    })
    .then((fichier: string) => {
      diffuser(req, "modifierEnfantEcodim", { idUtilisateur: data?.idUtilisateur });
      res.status(200).send({ status: 1, data: { photoEnfant: fichier } });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const recupImagesActivite = (req: Request, res: Response) =>
  repondre(
    res,
    functions.recupImagesActivite(
      Number(req.params.idActiviteEcodim),
      Number(req.query.idUtilisateur)
    )
  );

const ajouterImageActivite = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .ajouterImageActivite({
      idActiviteEcodim: Number(data?.idActiviteEcodim),
      idUtilisateur: Number(data?.idUtilisateur),
      image: String(data?.image || ""),
      legende: data?.legende,
    })
    .then((fichier: string) => {
      diffuser(req, "ajouterImageActiviteEcodim", { idUtilisateur: data?.idUtilisateur });
      res.status(200).send({ status: 1, data: { fichierImage: fichier } });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const supprimerImageActivite = (req: Request, res: Response) => {
  const { idImageActivite, idUtilisateur } = req.body;

  return functions
    .supprimerImageActivite(Number(idImageActivite), Number(idUtilisateur))
    .then((result: any) => {
      diffuser(req, "supprimerImageActiviteEcodim", { idUtilisateur });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

// ------------------------------------------------------------------ cultes

const recupCultesByUtilisateur = (req: Request, res: Response) =>
  repondre(res, functions.recupCultes(Number(req.params.idUtilisateur)));

const ajouterCulte = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .ajouterCulte(data)
    .then((result: any) => {
      diffuser(req, "ajouterCulteEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const modifierCulte = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .modifierCulte(data)
    .then((result: any) => {
      diffuser(req, "modifierCulteEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const supprimerCulte = (req: Request, res: Response) => {
  const { idCulteEcodim, idUtilisateur } = req.body;

  return functions
    .supprimerCulte(Number(idCulteEcodim), Number(idUtilisateur))
    .then((result: any) => {
      diffuser(req, "supprimerCulteEcodim", { idUtilisateur, idCulteEcodim });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

// ------------------------------------------------------------- évaluations

const recupEvaluationsByUtilisateur = (req: Request, res: Response) =>
  repondre(res, functions.recupEvaluations(Number(req.params.idUtilisateur)));

const ajouterEvaluation = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .ajouterEvaluation(data)
    .then((result: any) => {
      diffuser(req, "ajouterEvaluationEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const modifierEvaluation = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .modifierEvaluation(data)
    .then((result: any) => {
      diffuser(req, "modifierEvaluationEcodim", { idUtilisateur: data?.idUtilisateur, data: result });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const supprimerEvaluation = (req: Request, res: Response) => {
  const { idEvaluation, idUtilisateur } = req.body;

  return functions
    .supprimerEvaluation(Number(idEvaluation), Number(idUtilisateur))
    .then((result: any) => {
      diffuser(req, "supprimerEvaluationEcodim", { idUtilisateur, idEvaluation });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

const recupNotesByUtilisateur = (req: Request, res: Response) =>
  repondre(res, functions.recupNotes(Number(req.params.idUtilisateur)));

const enregistrerNotes = (req: Request, res: Response) => {
  const data = req.body;

  return functions
    .enregistrerNotes({ idUtilisateur: Number(data?.idUtilisateur), notes: data?.notes })
    .then((result: any) => {
      diffuser(req, "enregistrerNotesEcodim", { idUtilisateur: data?.idUtilisateur });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));
};

export default {
  recupClassesByUtilisateur,
  ajouterClasse,
  modifierClasse,
  supprimerClasse,
  recupMoniteursByUtilisateur,
  ajouterMoniteur,
  modifierMoniteur,
  supprimerMoniteur,
  recupEnfantsByUtilisateur,
  ajouterEnfant,
  modifierEnfant,
  supprimerEnfant,
  recupActivitesByUtilisateur,
  ajouterActivite,
  modifierActivite,
  supprimerActivite,
  enregistrerPhotoEnfant,
  recupImagesActivite,
  ajouterImageActivite,
  supprimerImageActivite,
  recupCultesByUtilisateur,
  ajouterCulte,
  modifierCulte,
  supprimerCulte,
  recupEvaluationsByUtilisateur,
  ajouterEvaluation,
  modifierEvaluation,
  supprimerEvaluation,
  recupNotesByUtilisateur,
  enregistrerNotes,
};
