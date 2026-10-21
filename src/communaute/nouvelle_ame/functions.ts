import { _executeSql, _selectSql } from "../../db";
import { INouvelleAme, } from "./interfaces";

//   
const ajouterNouvelleAme = (data: INouvelleAme) => {
    // juste pour la demo

    const values = [
        data.nomNouvelleAme,
        data.prenomNouvelleAme,
        data.dateConversionNouvelleAme,
        data.lieuHabitationNouvelleAme,
        data.fonctionNouvelleAme,
        data.contactNouvelleAme,
        data.sexeNouvelleAme,
        data.emailNouvelleAme,
        data.idEglise,  
        data.idCellule,
        data.idDepartement,
        data.idResponsabilite,
        data.idDomaineActivite,    
        data.idUtilisateur,
        data.idGroupe    
    ]
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `INSERT INTO nouvelleame(
              nomNouvelleAme,
              prenomNouvelleAme,
              dateConversionNouvelleAme,
              lieuHabitationNouvelleAme,
              fonctionNouvelleAme,
              contactNouvelleAme,
              sexeNouvelleAme,
              emailNouvelleAme,
              idEglise,
              idCellule,
              idDepartement,
              idResponsabilite,
              idDomaineActivite,
              idUtilisateur,
              idGroupe 
              ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const nouvelleAmeData: any = await _executeSql(sql, [...values]);
            resolve(nouvelleAmeData.insertId)
        } catch (error) {
            reject(error);
        }
    });
};


/**
 * récupérer les nouvelles âmes (table nouvelle_ame)
 * @returns 
 */
const recupNouvelleAme = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM nouvelleame ORDER BY idNouvelleAme ASC ;`
            const nouvelleAme = await _selectSql(sql, []);
            // Une liste vide est un résultat valide, pas une erreur.
            resolve(nouvelleAme)
        } catch (error) {
            reject(error);
        }
    });
};

const recupNouvelleAmeById = (id:number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM nouvelleame WHERE idNouvelleAme = ? ;`
            const nouvelleAme = await _selectSql(sql, [id]);
            if (!nouvelleAme.length) return reject({ name: "Erreur_ame", message: "Aucune âme trouvée pour les paramètres fournis" })
            resolve(nouvelleAme)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerNouvelleAme = (idNouvelleAme: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM nouvelleame WHERE idNouvelleAme = ?`;
      _executeSql(sql, [idNouvelleAme])
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  
const modifierNouvelleAme = (data: INouvelleAme): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = `UPDATE nouvelleame SET nomNouvelleAme=?, prenomNouvelleAme=?,dateConversionNouvelleAme=?,
        lieuHabitationNouvelleAme=?,fonctionNouvelleAme=?,contactNouvelleAme=?,sexeNouvelleAme=?,emailNouvelleAme=?,
        idEglise=?,idCellule=?,idDepartement=?,idResponsabilite=?,idDomaineActivite=?,idUtilisateur=?,idGroupe=? 
        WHERE idNouvelleAme=?`
        // L'ordre suit exactement celui des "?" de la requête : les 15 colonnes du SET,
        // puis l'identifiant du WHERE. Il était décalé (idNouvelleAme inséré en 12e
        // position), ce qui écrivait idGroupe dans idResponsabilite et filtrait la mise
        // à jour sur le mauvais identifiant.
        await _executeSql(sql, [
          data.nomNouvelleAme,
          data.prenomNouvelleAme,
          data.dateConversionNouvelleAme,
          data.lieuHabitationNouvelleAme,
          data.fonctionNouvelleAme,
          data.contactNouvelleAme,
          data.sexeNouvelleAme,
          data.emailNouvelleAme,
          data.idEglise,
          data.idCellule,
          data.idDepartement,
          data.idResponsabilite,
          data.idDomaineActivite,
          data.idUtilisateur,
          data.idGroupe,
          data.idNouvelleAme,
          ])
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
  
export default {
  ajouterNouvelleAme,
    recupNouvelleAme,
    supprimerNouvelleAme,
    modifierNouvelleAme,
    recupNouvelleAmeById
}