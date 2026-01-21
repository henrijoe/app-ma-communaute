import { _executeSql, _selectSql } from "../../db";
import { IGroupe,} from "./interfaces";

//   
const ajouterGroupe = (data: IGroupe) => {
    const values = [
        data.libelleGroupe,
        data.descriptionGroupe,
        data.responsableGroupe,
        data.idUtilisateur
    ]
    return new Promise(async (resolve, reject) => {
        try {
          // Vérification de l'existence des libellés
            const sqlCheck = `SELECT COUNT(*) as count FROM groupe WHERE libelleGroupe = ?`;
            const [result] = await _selectSql(sqlCheck, [data.libelleGroupe]);

            if (result.count > 0) {
                // Si les libellés existent déjà, rejeter avec un message approprié
                return reject(new Error('Ce groupe existe déjà.'));
              }
            // Si les libellés n'existent pas, insérer le nouveau département
            const sql = `INSERT INTO groupe(libelleGroupe,descriptionGroupe,responsableGroupe,idUtilisateur) VALUES (?,?,?,?)`;
            const groupeData: any = await _executeSql(sql, [...values]);
            resolve(groupeData.insertId)
        } catch (error) {
            reject(error);
        }
    });
};


/**
 * recupererer toute les groupes
 * @returns 
 */
const recupGroupe = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM groupe ORDER BY idGroupe ASC ;`
            const groupe = await _selectSql(sql, []);
            resolve(groupe)
        } catch (error) {
            reject(error);
        }
    });
};
// Fetcher une seule groupe
const recupGroupeId = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM groupe WHERE idGroupe =? ;`
            const groupe = await _selectSql(sql, [id]);
            resolve(groupe)
        } catch (error) {
            reject(error);
        }
    });
};

// const recupGroupeByIdUtilsateur = (idUtilisateur: number) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const sql = `SELECT * FROM groupe WHERE idUtilisateur= ?;`
//             const groupes = await _selectSql(sql, [idUtilisateur]);
//             if (!groupes.length) return reject({ name: "Erreur_groupe", message: "Aucun groupe trouvé" })
//             resolve(groupes)
//         } catch (error) {
//             reject(error);
//         }
//     });
// };


const recupGroupeByIdUtilsateur = (idUtilisateur: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM groupe WHERE idUtilisateur= ?;`
            const groupes = await _selectSql(sql, [idUtilisateur]);
            if (groupes.length === 0) {
                return reject({ name: "Erreur_groupe", message: "Aucun groupe trouvé" });
            }
            resolve(groupes);
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerGroupe = (idGroupe: number): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `DELETE FROM groupe WHERE idGroupe = ?`;
            await _executeSql(sql, [idGroupe])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    });
};

const modifierGroupe = (data: IGroupe): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `UPDATE groupe SET libelleGroupe=?, descriptionGroupe=?,responsableGroupe=?,idUtilisateur=? WHERE idGroupe=?`
            await _executeSql(sql, [
                data.libelleGroupe,
                data.descriptionGroupe,
                data.responsableGroupe,
                data.idGroupe,
                data.idUtilisateur,
            ])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

export default {
    recupGroupe,
    ajouterGroupe,
    supprimerGroupe,
    modifierGroupe,
    recupGroupeId,
    recupGroupeByIdUtilsateur
}
