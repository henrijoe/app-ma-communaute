import { Request, Response, Errback } from "express";
import services from "./services";


const ajouterQuestion = (req: Request, res: Response) => {
    const data = req.body
    
    console.log("🚀 ~ file: controllers.ts:7 ~ ajouterQuestion ~ data:", data)
    const io = (req as any).io;
    services
        .ajouterQuestion(data)
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

/**
 * Récupérer une cellule
 * @returns 
 */
const recupQuestion = (req: Request, res: Response) => {
    services
        .recupQuestion()
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerQuestion = (req: Request, res: Response) => {
    const { idQuestion } = req.body
    services
      .supprimerQuestion(idQuestion)
      .then((result: any) => {
        if (result) {
          res.status(200).send({ status: 1, data: result })
        } else {
          res.status(400).send({ status: 0, errors: 'Question non trouvée' })
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}
  
const modifierQuestion = (req: Request, res: Response) => {
    const data = req.body
    services
      .modifierQuestion(data)
      .then((result: any) => {
        res.status(200).send({ status: 1, data: result })
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }

export default {
    recupQuestion,
    ajouterQuestion,
    supprimerQuestion,
    modifierQuestion,
}
