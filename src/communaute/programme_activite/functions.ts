// Programmes d'activités (jeunesse d'abord) : une feuille par période, avec une
// ligne par rencontre — qui dirige, qui parle, l'activité, les thèmes, le lieu.
//
// Les lignes sont rangées en JSON dans `lignesProgramme` : la feuille se saisit,
// se relit et s'imprime d'un bloc, comme le programme des moniteurs de l'Ecodim.

import { _executeSql, _selectSql } from "../../db";

const texte = (valeur: unknown): string => String(valeur ?? "").trim();

const lignesEnTexte = (lignes: unknown): string => {
  if (lignes === null || lignes === undefined || lignes === "") return "[]";
  if (typeof lignes === "string") return lignes;
  return JSON.stringify(lignes);
};

const lireLignes = (valeur: unknown): any[] => {
  try {
    const lignes = JSON.parse(String(valeur || "[]"));
    return Array.isArray(lignes) ? lignes : [];
  } catch (_erreur) {
    return [];
  }
};

// Seule la jeunesse s'en sert pour l'instant ; la colonne permet d'en ouvrir
// d'autres (femmes, hommes...) sans nouvelle table.
const section = (valeur: unknown): string => texte(valeur) || "jeunesse";

const CHAMPS: { nom: string; valeur: (data: any) => any }[] = [
  { nom: "sectionProgramme", valeur: (d) => section(d.sectionProgramme) },
  { nom: "titreProgramme", valeur: (d) => texte(d.titreProgramme) },
  { nom: "dateDebutProgramme", valeur: (d) => texte(d.dateDebutProgramme) || null },
  { nom: "dateFinProgramme", valeur: (d) => texte(d.dateFinProgramme) || null },
  { nom: "enteteProgramme", valeur: (d) => texte(d.enteteProgramme) },
  { nom: "themeAnnuel", valeur: (d) => texte(d.themeAnnuel) },
  { nom: "passageTheme", valeur: (d) => texte(d.passageTheme) },
  { nom: "afficherOrateurs", valeur: (d) => (d.afficherOrateurs === false || Number(d.afficherOrateurs) === 0 ? 0 : 1) },
  { nom: "lignesProgramme", valeur: (d) => lignesEnTexte(d.lignesProgramme ?? d.lignes) },
  { nom: "dateModification", valeur: () => new Date().toISOString() },
];

const COLONNES = CHAMPS.map((champ) => champ.nom).join(", ");
const PLACEHOLDERS = CHAMPS.map(() => "?").join(",");
const AFFECTATIONS = CHAMPS.map((champ) => `${champ.nom} = ?`).join(", ");
const valeurs = (data: any) => CHAMPS.map((champ) => champ.valeur(data));

const verifier = (data: any) => {
  if (!texte(data?.titreProgramme)) {
    throw new Error("Donnez un titre au programme.");
  }
};

export const recupProgrammes = async (idUtilisateur: number, sectionProgramme?: string): Promise<any[]> => {
  const lignes: any = await _selectSql(
    `SELECT * FROM programme_activite
      WHERE idUtilisateur = ? AND sectionProgramme = ?
      ORDER BY dateDebutProgramme DESC, idProgrammeActivite DESC`,
    [idUtilisateur, section(sectionProgramme)]
  );

  return (Array.isArray(lignes) ? lignes : []).map((ligne: any) => ({
    ...ligne,
    lignes: lireLignes(ligne.lignesProgramme),
  }));
};

export const ajouterProgramme = async (data: any): Promise<any> => {
  verifier(data);
  const resultat: any = await _executeSql(
    `INSERT INTO programme_activite (${COLONNES}, idUtilisateur) VALUES (${PLACEHOLDERS},?)`,
    [...valeurs(data), data.idUtilisateur]
  );
  return resultat?.insertId ?? resultat?.lastID ?? null;
};

export const modifierProgramme = async (data: any): Promise<boolean> => {
  verifier(data);
  await _executeSql(
    `UPDATE programme_activite SET ${AFFECTATIONS} WHERE idProgrammeActivite = ? AND idUtilisateur = ?`,
    [...valeurs(data), data.idProgrammeActivite, data.idUtilisateur]
  );
  return true;
};

export const supprimerProgramme = async (idProgrammeActivite: number, idUtilisateur: number): Promise<boolean> => {
  await _executeSql(
    `DELETE FROM programme_activite WHERE idProgrammeActivite = ? AND idUtilisateur = ?`,
    [idProgrammeActivite, idUtilisateur]
  );
  return true;
};

export default { recupProgrammes, ajouterProgramme, modifierProgramme, supprimerProgramme };
