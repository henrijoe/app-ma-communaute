// Membres d'une famille de jeunesse.
//
// Une famille ne portait qu'un nombre de membres saisi à la main. Le lien
// membre ↔ famille permet d'imprimer la feuille de la famille avec, pour chacun,
// ses contacts, son domicile, son baptême, son niveau d'étude et sa fonction —
// lus sur sa fiche de membre, jamais ressaisis.
//
// Un membre n'appartient qu'à une famille : l'ajouter à une famille le retire de
// celle où il était.

import express, { Router, Request, Response } from "express";

import { _executeSql, _selectSql } from "../../db";
import { errorMsg } from "../functions";

export const recupMembresFamilles = async (idUtilisateur: number): Promise<any[]> => {
  const lignes: any = await _selectSql(
    `SELECT lien.idFamilleJeunesse, lien.idMembre,
            membre.nomMembre, membre.prenomMembre, membre.contactMembre,
            membre.residenceMembre, membre.baptemeEauMembre, membre.fonctionMembre,
            niveau.libelleNiveauEtude
       FROM famille_jeunesse_membre lien
       JOIN membre ON membre.idMembre = lien.idMembre
       LEFT JOIN niveau_etude niveau ON niveau.idNiveauEtude = membre.idNiveauEtude
      WHERE lien.idUtilisateur = ?
      ORDER BY membre.nomMembre ASC, membre.prenomMembre ASC`,
    [idUtilisateur]
  );
  return Array.isArray(lignes) ? lignes : [];
};

export const enregistrerMembresFamille = async (data: any): Promise<boolean> => {
  const idFamille = Number(data?.idFamilleJeunesse);
  const idUtilisateur = Number(data?.idUtilisateur);
  if (!idFamille || !idUtilisateur) {
    throw new Error("Famille ou église introuvable.");
  }

  const membres: number[] = Array.from(
    new Set((Array.isArray(data?.membres) ? data.membres : []).map(Number).filter((id: number) => id > 0))
  );

  // La liste envoyée remplace celle de la famille.
  await _executeSql(
    "DELETE FROM famille_jeunesse_membre WHERE idFamilleJeunesse = ? AND idUtilisateur = ?",
    [idFamille, idUtilisateur]
  );

  for (const idMembre of membres) {
    // Un membre ne reste que dans une famille.
    await _executeSql(
      "DELETE FROM famille_jeunesse_membre WHERE idMembre = ? AND idUtilisateur = ?",
      [idMembre, idUtilisateur]
    );
    await _executeSql(
      "INSERT INTO famille_jeunesse_membre (idFamilleJeunesse, idMembre, idUtilisateur) VALUES (?,?,?)",
      [idFamille, idMembre, idUtilisateur]
    );
  }

  return true;
};

const membresFamilleRouter: Router = express.Router();

membresFamilleRouter.get(
  "/recupmembresfamillejeunessebyutilisateur/:idUtilisateur",
  (req: Request, res: Response) =>
    recupMembresFamilles(Number(req.params.idUtilisateur))
      .then((result) => res.status(200).send({ status: 1, data: result }))
      .catch((error) => res.status(400).send({ status: 0, error: errorMsg(error) }))
);

membresFamilleRouter.post("/enregistrermembresfamillejeunesse", (req: Request, res: Response) =>
  enregistrerMembresFamille(req.body)
    .then((result) => {
      (req as any).io?.emit("modifierFamilleJeunesse", { idUtilisateur: req.body?.idUtilisateur });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error) => res.status(400).send({ status: 0, error: errorMsg(error) }))
);

export default membresFamilleRouter;
