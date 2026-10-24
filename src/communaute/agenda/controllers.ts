import { Request, Response } from "express";
import services from "./services";

const ajouterAgenda = (req: Request, res: Response) => {
  const data = req.body;
  services
    .ajouterAgenda(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const supprimerAgenda = (req: Request, res: Response) => {
  const { idAgenda } = req.body;
  services
    .supprimerAgenda(idAgenda)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors: errors?.message || errors }));
};

const modifierAgenda = (req: Request, res: Response) => {
  const data = req.body;
  services
    .modifierAgenda(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors: errors?.message || errors }));
};

const recupAgendaByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req.params;
  services
    .recupAgendaByIdUtilsateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

export default {
  ajouterAgenda,
  supprimerAgenda,
  modifierAgenda,
  recupAgendaByIdUtilsateur,
};
