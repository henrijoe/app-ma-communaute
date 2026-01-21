import functions from "./functions";
import { IQuestions} from "./interfaces";

/**
 * 
Permet d'ajouter une question
 * @returns 
 */
const ajouterQuestion = (data: IQuestions) => {
  console.log("🚀 ~ file: services.ts:10 ~ ajouterQuestion ~ data:", data)
  return new Promise(async (resolve, reject) => {
    try {
      const idQuestion: any = await functions.ajouterQuestion({ ...data })
      // const question = await functions.recupQuestionId(idQuestion)
      resolve(idQuestion)
    } catch (error) {
      reject(error);
    }
  });
};

const recupQuestion = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const questions = await functions.recupQuestion()
      resolve(questions)
    } catch (error) {
      reject(error);
    }
  });
};

const supprimerQuestion = (idQuestion: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.supprimerQuestion(idQuestion)
      resolve({idQuestion:idQuestion})
    } catch (error) {
      reject(error)
    }
  })
}


const modifierQuestion = (data: IQuestions) => {
  return new Promise(async (resolve, reject) => {
    try {
      await functions.modifierQuestion(data)
      resolve(data)
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
}

