import { _executeSql, _selectSql } from "../../db";
import { IUtilisateur } from "./interfaces";

const bcrypt = require('bcrypt');



//   
const ajouterUtilisateur = (data: IUtilisateur) => {

  return new Promise(async (resolve, reject) => {
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 20);
    const hashedconfirmPassword = await bcrypt.hash(data.confirmPassword, 20);
    try {
      const values = [
        data.logoUtilisateur,
        data.nomTemple,
        data.nomUtilisateur,
        data.prenomUtilisateur,
        data.telephoneUtilisateur,
        data.password,
        hashedconfirmPassword,
        data.email
      ]
      const sql = `INSERT INTO utilisateur(logoUtilisateur,nomTemple,nomUtilisateur,prenomUtilisateur,telephoneUtilisateur,password,confirmPassword,email) VALUES (?,?,?,?,?,?,?,?)`;
      // const sql = `INSERT INTO utilisateur SET ?`;
      const departement: any = await _executeSql(sql, [...values]);
      resolve(departement.insertId)
    } catch (error) {
      reject(error);
    }
  });
};

const recupUtilisateur = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM utilisateur ORDER BY idUtilisateur ASC ;`
      const urilisateur = await _selectSql(sql, []);
      resolve(urilisateur)
    } catch (error) {
      reject(error);
    }
  });
};

const recupUtilisateurById = (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `SELECT * FROM utilisateur WHERE idUtilisateur = ?;`
      const urilisateur = await _selectSql(sql, [id]);
      resolve(urilisateur)
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerUtilisateur = (idUtilisateur: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM utilisateur WHERE idUtilisateur = ?`;
    _executeSql(sql, [idUtilisateur])
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const modifierUtilisateur = (data: IUtilisateur): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `UPDATE utilisateur SET logoUtilisateur=?,nomTemple=?, nomUtilisateur=?,prenomUtilisateur=?,telephoneUtilisateur=?,password=?,confirmPassword=?,email=? WHERE idUtilisateur=?`
      await _executeSql(sql, [
        data.logoUtilisateur,
        data.nomTemple,
        data.nomUtilisateur,
        data.prenomUtilisateur,
        data.telephoneUtilisateur,
        data.password,
        data.confirmPassword,
        data.email,
        data.idUtilisateur
      ])
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

const login = (data: IUtilisateur): Promise<IUtilisateur> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { nomUtilisateur, password } = data;
      // console.log("🚀 ~ file: functions.ts:142 ~ returnnewPromise ~ data.body", data.body)
      const sql = `SELECT * FROM utilisateur  WHERE nomUtilisateur=? AND password=?`;

      const x = await _selectSql(sql, [nomUtilisateur, password]);
      // console.log("🚀 ~ returnnewPromise ~ x:", x)

      if (!x || x.length === 0) {
        throw new Error('Nom Utilisateur ou Mot de passe incorrect !.');
      }

      if (x.length !== 1) {
        reject({ message: "identifiant incorrect" });
      } else {
        console.log("🚀 ~ returnnewPromise ~ x[0]:", x[0])
        resolve(x[0]);
      }
      // resolve(x[0]);
    } catch (err) {
      console.log("err:", err);
      reject(err);
    }
  });
};

/**
 * Mettre à jour le mot de passe d'un utilisateur
 * @param data
 */
export const modifierLogin = (idUtilisateur: number, password: (string | null), confirmPassword: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      //mise a jour du mot de passe
      const sql = `UPDATE utilisateur
                       SET password=?,
                       confirmPassword=?
                       WHERE idUtilisateur=?`
      await _executeSql(sql, [password, confirmPassword, idUtilisateur])
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  ajouterUtilisateur,
  recupUtilisateur,
  supprimerUtilisateur,
  modifierUtilisateur,
  recupUtilisateurById,
  login,
  modifierLogin
}
