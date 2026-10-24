import { _executeSql, _selectSql } from "../../db";
import sqliteDB from "../../db/sqliteDB";
import { SHARED_TABLES, buildAddColumnSql, buildCreateTableSql } from "../../db/schema";
import { IFamilleJeunesse } from "./interfaces";

const textValue = (value: unknown): string => String(value || "").trim();
const numberValue = (value: unknown): number => Number(value || 0) || 0;

const ensureColumn = async (alterStatement: string) => {
  try {
    await _executeSql(alterStatement, []);
  } catch (error) {
    // La colonne existe déjà sur les bases déjà mises à jour.
  }
};

const ensureFamilleJeunesseTable = async () => {
  // Le schéma n'est plus écrit ici : il vient de db/schema.ts, décrit une seule fois
  // et traduit pour SQLite comme pour MySQL. Il est appliqué au démarrage du serveur ;
  // on le rejoue à l'usage pour les bases ouvertes avant cette étape.
  const dialect = sqliteDB.isSqliteMode() ? "sqlite" : "mysql";
  const table = SHARED_TABLES.find((item) => item.name === "famille_jeunesse");

  if (!table) {
    return;
  }

  await _executeSql(buildCreateTableSql(table, dialect), []);

  for (const column of table.columns.filter((item) => item.type !== "pk")) {
    await ensureColumn(buildAddColumnSql(table.name, column, dialect));
  }
};

const getValues = (data: IFamilleJeunesse) => [
  textValue(data.nomFamilleJeunesse),
  textValue(data.sloganFamille),
  textValue(data.conseillerFamille),
  textValue(data.nomAnimateur),
  textValue(data.nomViceAnimateur),
  textValue(data.nomSecretaire),
  textValue(data.nomSecretaireAdjoint),
  textValue(data.nomTresorier),
  textValue(data.nomTresorierAdjoint),
  textValue(data.nomSecretaireOrganisation1),
  textValue(data.nomSecretaireOrganisation2),
  textValue(data.nomSecretaireOrganisation3),
  textValue(data.nomCommissaireAuCompte),
  textValue(data.nomCommissaireAuCompteAdjoint),
  numberValue(data.nombreMembreTotal),
  numberValue(data.nombreMembreActuel),
  textValue(data.remarque),
  Number(data.idUtilisateur),
];

const ajouterFamilleJeunesse = (data: IFamilleJeunesse) => {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureFamilleJeunesseTable();

      const values = getValues(data);
      const sql = `
        INSERT INTO famille_jeunesse(
          nomFamilleJeunesse,
          sloganFamille,
          conseillerFamille,
          nomAnimateur,
          nomViceAnimateur,
          nomSecretaire,
          nomSecretaireAdjoint,
          nomTresorier,
          nomTresorierAdjoint,
          nomSecretaireOrganisation1,
          nomSecretaireOrganisation2,
          nomSecretaireOrganisation3,
          nomCommissaireAuCompte,
          nomCommissaireAuCompteAdjoint,
          nombreMembreTotal,
          nombreMembreActuel,
          remarque,
          idUtilisateur
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `;

      const inserted: any = await _executeSql(sql, values);
      resolve(inserted.insertId);
    } catch (error) {
      reject(error);
    }
  });
};

const recupFamilleJeunesse = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureFamilleJeunesseTable();
      const sql = `SELECT * FROM famille_jeunesse ORDER BY idFamilleJeunesse DESC`;
      const familles = await _selectSql(sql, []);
      resolve(familles);
    } catch (error) {
      reject(error);
    }
  });
};

const recupFamilleJeunesseId = (idFamilleJeunesse: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureFamilleJeunesseTable();
      const sql = `SELECT * FROM famille_jeunesse WHERE idFamilleJeunesse = ?`;
      const familles = await _selectSql(sql, [idFamilleJeunesse]);
      resolve(familles);
    } catch (error) {
      reject(error);
    }
  });
};

const recupFamilleJeunesseByIdUtilisateur = (idUtilisateur: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureFamilleJeunesseTable();
      const sql = `SELECT * FROM famille_jeunesse WHERE idUtilisateur = ? ORDER BY idFamilleJeunesse DESC`;
      const familles = await _selectSql(sql, [idUtilisateur]);
      resolve(Array.isArray(familles) ? familles : []);
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerFamilleJeunesse = (idFamilleJeunesse: number, idUtilisateur?: number): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureFamilleJeunesseTable();
      const hasUserScope = typeof idUtilisateur === "number";
      const sql = hasUserScope
        ? `DELETE FROM famille_jeunesse WHERE idFamilleJeunesse = ? AND idUtilisateur = ?`
        : `DELETE FROM famille_jeunesse WHERE idFamilleJeunesse = ?`;
      const params = hasUserScope ? [idFamilleJeunesse, idUtilisateur] : [idFamilleJeunesse];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

const modifierFamilleJeunesse = (data: IFamilleJeunesse): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureFamilleJeunesseTable();
      const hasUserScope = typeof data.idUtilisateur === "number";
      const sql = hasUserScope
        ? `UPDATE famille_jeunesse SET nomFamilleJeunesse=?, sloganFamille=?, conseillerFamille=?, nomAnimateur=?, nomViceAnimateur=?, nomSecretaire=?, nomSecretaireAdjoint=?, nomTresorier=?, nomTresorierAdjoint=?, nomSecretaireOrganisation1=?, nomSecretaireOrganisation2=?, nomSecretaireOrganisation3=?, nomCommissaireAuCompte=?, nomCommissaireAuCompteAdjoint=?, nombreMembreTotal=?, nombreMembreActuel=?, remarque=?, idUtilisateur=? WHERE idFamilleJeunesse=? AND idUtilisateur=?`
        : `UPDATE famille_jeunesse SET nomFamilleJeunesse=?, sloganFamille=?, conseillerFamille=?, nomAnimateur=?, nomViceAnimateur=?, nomSecretaire=?, nomSecretaireAdjoint=?, nomTresorier=?, nomTresorierAdjoint=?, nomSecretaireOrganisation1=?, nomSecretaireOrganisation2=?, nomSecretaireOrganisation3=?, nomCommissaireAuCompte=?, nomCommissaireAuCompteAdjoint=?, nombreMembreTotal=?, nombreMembreActuel=?, remarque=?, idUtilisateur=? WHERE idFamilleJeunesse=?`;
      const params = hasUserScope
        ? [...getValues(data), data.idFamilleJeunesse, data.idUtilisateur]
        : [...getValues(data), data.idFamilleJeunesse];

      await _executeSql(sql, params);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterFamilleJeunesse,
  modifierFamilleJeunesse,
  recupFamilleJeunesse,
  recupFamilleJeunesseByIdUtilisateur,
  recupFamilleJeunesseId,
  supprimerFamilleJeunesse,
};
