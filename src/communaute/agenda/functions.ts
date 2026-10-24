import { _executeSql, _selectSql } from "../../db";
import { IAgenda } from "./interfaces";

const ajouterAgenda = (data: IAgenda) => {
  const values = [
    data.titreAgenda,
    data.typeAgenda,
    data.dateAgenda,
    data.heureDebutAgenda,
    data.heureFinAgenda,
    data.lieuAgenda,
    data.descriptionAgenda,
    data.couleurAgenda,
    data.statutAgenda,
    data.idUtilisateur,
  ];

  return new Promise(async (resolve, reject) => {
    try {
      const sql = `INSERT INTO agenda(titreAgenda,typeAgenda,dateAgenda,heureDebutAgenda,heureFinAgenda,lieuAgenda,descriptionAgenda,couleurAgenda,statutAgenda,idUtilisateur) VALUES (?,?,?,?,?,?,?,?,?,?)`;
      const agendaData: any = await _executeSql(sql, values);
      resolve(agendaData.insertId);
    } catch (error) {
      reject(error);
    }
  });
};

const recupAgendaId = (id: number) => new Promise(async (resolve, reject) => {
  try {
    const sql = `SELECT * FROM agenda WHERE idAgenda = ? ;`;
    const agenda = await _selectSql(sql, [id]);
    resolve(agenda);
  } catch (error) {
    reject(error);
  }
});

const recupAgendaByIdUtilsateur = (idUtilisateur: number) => new Promise(async (resolve, reject) => {
  try {
    const sql = `SELECT * FROM agenda WHERE idUtilisateur = ? ORDER BY dateAgenda ASC, heureDebutAgenda ASC;`;
    const agenda = await _selectSql(sql, [idUtilisateur]);
    resolve(agenda);
  } catch (error) {
    reject(error);
  }
});

const supprimerAgenda = (idAgenda: number): Promise<boolean> => new Promise(async (resolve, reject) => {
  try {
    const sql = `DELETE FROM agenda WHERE idAgenda = ?`;
    await _executeSql(sql, [idAgenda]);
    resolve(true);
  } catch (error) {
    reject(error);
  }
});

const modifierAgenda = (data: IAgenda): Promise<boolean> => new Promise(async (resolve, reject) => {
  try {
    const sql = `UPDATE agenda SET titreAgenda=?,typeAgenda=?,dateAgenda=?,heureDebutAgenda=?,heureFinAgenda=?,lieuAgenda=?,descriptionAgenda=?,couleurAgenda=?,statutAgenda=?,idUtilisateur=? WHERE idAgenda=?`;
    await _executeSql(sql, [
      data.titreAgenda,
      data.typeAgenda,
      data.dateAgenda,
      data.heureDebutAgenda,
      data.heureFinAgenda,
      data.lieuAgenda,
      data.descriptionAgenda,
      data.couleurAgenda,
      data.statutAgenda,
      data.idUtilisateur,
      data.idAgenda,
    ]);
    resolve(true);
  } catch (error) {
    reject(error);
  }
});

export default {
  ajouterAgenda,
  recupAgendaId,
  recupAgendaByIdUtilsateur,
  supprimerAgenda,
  modifierAgenda,
};
