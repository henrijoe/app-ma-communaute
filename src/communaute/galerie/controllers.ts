import fs from "fs";
import { Request, Response } from "express";
import services from "./services";

const ajouterGalerie = (req: Request, res: Response) => {
  services.ajouterGalerie(req.body)
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const recupGaleriesByUtilisateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req.params;

  services.recupGaleriesByUtilisateur(Number(idUtilisateur))
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const modifierGalerie = (req: Request, res: Response) => {
  services.modifierGalerie(req.body)
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const supprimerGalerie = (req: Request, res: Response) => {
  const { idGalerie, idUtilisateur } = req.body;

  services.supprimerGalerie(Number(idGalerie), idUtilisateur ? Number(idUtilisateur) : undefined)
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const recupImagesGalerie = (req: Request, res: Response) => {
  const { idGalerie } = req.params;

  services.recupImagesGalerie(Number(idGalerie))
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const ajouterImagesGalerie = (req: Request, res: Response) => {
  services.ajouterImagesGalerie(req.body)
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const modifierImageGalerie = (req: Request, res: Response) => {
  services.modifierImageGalerie(req.body)
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const definirCouvertureGalerie = (req: Request, res: Response) => {
  services.definirCouvertureGalerie(req.body)
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const supprimerImageGalerie = (req: Request, res: Response) => {
  const { idGalerieImage, idUtilisateur } = req.body;

  services.supprimerImageGalerie(Number(idGalerieImage), idUtilisateur ? Number(idUtilisateur) : undefined)
    .then((result: any) => res.status(200).send({ status: 1, data: result }))
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

const telechargerGalerie = (req: Request, res: Response) => {
  const { idGalerie } = req.params;
  const idUtilisateur = req.query.idUtilisateur ? Number(req.query.idUtilisateur) : undefined;

  services.buildGalerieZip(Number(idGalerie), idUtilisateur)
    .then(({ filePath, fileName }: any) => {
      res.download(filePath, fileName, (error) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (error) {
          console.error("Erreur telechargement galerie:", error);
        }
      });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error: error?.message || error }));
};

export default {
  ajouterGalerie,
  recupGaleriesByUtilisateur,
  modifierGalerie,
  supprimerGalerie,
  recupImagesGalerie,
  ajouterImagesGalerie,
  modifierImageGalerie,
  definirCouvertureGalerie,
  supprimerImageGalerie,
  telechargerGalerie,
};
