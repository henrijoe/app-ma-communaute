import express, { Router, Request, Response } from "express";

import { errorMsg } from "../functions";
import functions from "./functions";

const programmeActiviteRouter: Router = express.Router();

const diffuser = (req: Request, evenement: string, charge: any) => {
  (req as any).io?.emit(evenement, charge);
};

const repondre = (res: Response, promesse: Promise<any>, apres?: (result: any) => void) =>
  promesse
    .then((result: any) => {
      apres?.(result);
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: errorMsg(error) }));

// Lecture bornée à l'église par la convention ".../byutilisateur/:idUtilisateur".
programmeActiviteRouter.get(
  "/recupprogrammeactivitebyutilisateur/:idUtilisateur",
  (req: Request, res: Response) =>
    repondre(
      res,
      functions.recupProgrammes(Number(req.params.idUtilisateur), String(req.query.section || ""))
    )
);

programmeActiviteRouter.post("/insererprogrammeactivite", (req: Request, res: Response) =>
  repondre(res, functions.ajouterProgramme(req.body), (result) =>
    diffuser(req, "ajouterProgrammeActivite", { idUtilisateur: req.body?.idUtilisateur, data: result })
  )
);

programmeActiviteRouter.post("/modifierprogrammeactivite", (req: Request, res: Response) =>
  repondre(res, functions.modifierProgramme(req.body), (result) =>
    diffuser(req, "modifierProgrammeActivite", { idUtilisateur: req.body?.idUtilisateur, data: result })
  )
);

programmeActiviteRouter.post("/supprimerprogrammeactivite", (req: Request, res: Response) => {
  const { idProgrammeActivite, idUtilisateur } = req.body || {};
  return repondre(
    res,
    functions.supprimerProgramme(Number(idProgrammeActivite), Number(idUtilisateur)),
    () => diffuser(req, "supprimerProgrammeActivite", { idUtilisateur, idProgrammeActivite })
  );
});

export default programmeActiviteRouter;
