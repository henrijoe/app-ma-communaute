import { _executeSql, _selectSql } from "../../db";
import { IQuestions,} from "./interfaces";

//   
// const ajouterQuestion = (data: IQuestions) => {
//     const values = [ 
//         data.question,
//         data.options,
//         data.correctOption,
//         data.niveau,
//         data.idEglise
//     ]
//     return new Promise(async (resolve, reject) => {
//         try {
//             const sql = `INSERT INTO questions(question,options,correctOption,niveau,idEglise) VALUES (?,?,?,?,?)`;
//             const questionData: any = await _executeSql(sql, [...values]);
//             const dataFinally = JSON.stringify(questionData)
//             console.log("🚀 ~ file: functions.ts:18 ~ returnnewPromise ~ dataFinally:", dataFinally)
//             resolve(dataFinally)
//         } catch (error) {
//             reject(error);
//         }
//     });
// };

const ajouterQuestion = (data: IQuestions) => {
    const values = [
        data.question,
        JSON.stringify(data.options),  // Convertir le tableau en chaîne JSON
        data.correctOption,
        data.niveau,
        data.idEglise
    ];

    return new Promise(async (resolve, reject) => {
        try {
            const sql = `INSERT INTO questions(question,options,correctOption,niveau,idEglise) VALUES (?,?,?,?,?)`;
            const questionData: any = await _executeSql(sql, values);

            // Vous pouvez omettre cette partie si vous ne souhaitez pas convertir le résultat en JSON
            const dataFinally = {
                idQuestion: questionData.insertId,
                question: data.question,
                options: data.options, // Remarquez que nous utilisons toujours le tableau d'options original ici
                correctOption: data.correctOption,
                niveau: data.niveau,
                idEglise: data.idEglise
            };

            resolve(dataFinally);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * recupererer toute les quetions
 * @returns 
 */
const recupQuestion = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM questions ORDER BY idQuestion ASC ;`
            const questions = await _selectSql(sql, []);
            resolve(questions)
        } catch (error) {
            reject(error);
        }
    });
};
// Fetcher une seule questions
const recupQuestionId = (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `SELECT * FROM questions WHERE idQuestion =? ;`
            const questions = await _selectSql(sql, [id]);
            resolve(questions)
        } catch (error) {
            reject(error);
        }
    });
};

const supprimerQuestion = (idQuestion: number): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `DELETE FROM questions WHERE idQuestion = ?`;
            await _executeSql(sql, [idQuestion])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    });
};

const modifierQuestion = (data: IQuestions): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try {
            const sql = `UPDATE questions SET question=?, options=?,correctOption=?,niveau=?,idEglise=? WHERE idQuestion=?`
            await _executeSql(sql, [
                data.question,
                data.options,
                data.correctOption,
                data.niveau,
                data.idEglise,
            ])
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

export default {
    ajouterQuestion,
    recupQuestion,
    supprimerQuestion,
    modifierQuestion,
    recupQuestionId
}
