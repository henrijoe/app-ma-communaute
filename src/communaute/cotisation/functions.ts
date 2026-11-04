import { _executeSql, _selectSql } from "../../db";

// Toutes les requêtes portent aussi sur idUtilisateur : en ligne, les églises partagent
// la même base, et un identifiant seul ne dit pas à quelle église une ligne appartient.

export type DonneesCotisation = {
  nomCotisation: string;
  idMembre: number;
  nomMembreVersement: string;
  montantVersement: number;
  dateVersement: string;
  observationVersement: string;
  idUtilisateur: number;
};

const recupCotisations = (idUtilisateur: number): Promise<any> =>
  _selectSql(
    `SELECT * FROM autre_cotisation WHERE idUtilisateur = ?
     ORDER BY dateVersement DESC, idCotisation DESC;`,
    [idUtilisateur]
  );

const recupCotisation = async (idCotisation: number, idUtilisateur: number): Promise<any> => {
  const lignes: any = await _selectSql(
    `SELECT * FROM autre_cotisation WHERE idCotisation = ? AND idUtilisateur = ?;`,
    [idCotisation, idUtilisateur]
  );
  return lignes?.[0] || null;
};

// Un compte secondaire enregistre aussi des membres : ils appartiennent à la même église.
const recupMembre = async (idMembre: number, idUtilisateur: number): Promise<any> => {
  const lignes: any = await _selectSql(
    `SELECT idMembre, nomMembre, prenomMembre FROM membre
     WHERE idMembre = ?
       AND (idUtilisateur = ?
            OR idUtilisateur IN (SELECT idUtilisateur FROM utilisateur WHERE idUtilisateurParent = ?));`,
    [idMembre, idUtilisateur, idUtilisateur]
  );
  return lignes?.[0] || null;
};

const ajouterCotisation = async (data: DonneesCotisation) => {
  const resultat: any = await _executeSql(
    `INSERT INTO autre_cotisation
       (nomCotisation, idMembre, nomMembreVersement, montantVersement, dateVersement, observationVersement, idUtilisateur)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      data.nomCotisation,
      data.idMembre,
      data.nomMembreVersement,
      data.montantVersement,
      data.dateVersement,
      data.observationVersement,
      data.idUtilisateur,
    ]
  );
  return Number(resultat.insertId);
};

const modifierCotisation = async (idCotisation: number, data: DonneesCotisation) => {
  await _executeSql(
    `UPDATE autre_cotisation
     SET nomCotisation = ?, idMembre = ?, nomMembreVersement = ?, montantVersement = ?,
         dateVersement = ?, observationVersement = ?
     WHERE idCotisation = ? AND idUtilisateur = ?;`,
    [
      data.nomCotisation,
      data.idMembre,
      data.nomMembreVersement,
      data.montantVersement,
      data.dateVersement,
      data.observationVersement,
      idCotisation,
      data.idUtilisateur,
    ]
  );
};

const supprimerCotisation = async (idCotisation: number, idUtilisateur: number) => {
  await _executeSql(`DELETE FROM autre_cotisation WHERE idCotisation = ? AND idUtilisateur = ?;`, [
    idCotisation,
    idUtilisateur,
  ]);
};

export default {
  recupCotisations,
  recupCotisation,
  recupMembre,
  ajouterCotisation,
  modifierCotisation,
  supprimerCotisation,
};
