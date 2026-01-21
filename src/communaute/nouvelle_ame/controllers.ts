import { Request, Response, Errback } from "express";
import services from "./services";


const ajouterNouvelleAme = (req: Request, res: Response) => {
    const data = req.body
    const io = (req as any).io;
    services
        .ajouterNouvelleAme(data)
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

/**
 * Récupérer un membre
 * @returns 
 */
const recupNouvelleAme = (req: Request, res: Response) => {
    services
        .recupNouvelleAme()
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerNouvelleAme = (req: Request, res: Response) => {
    const { idNouvelleAme } = req.body
    services
      .supprimerNouvelleAme(idNouvelleAme)
      .then((result: any) => {
        if (result) {
          res.status(200).send({ status: 1, data: result })
        } else {
          res.status(400).send({ status: 0, errors: 'membre non trouvé' })
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}
  
const modifierNouvelleAme = (req: Request, res: Response) => {
    const data = req.body
    services
      .modifierNouvelleAme(data)
      .then((result: any) => {
        res.status(200).send({ status: 1, data: result })
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }

export default {
    recupNouvelleAme,
    ajouterNouvelleAme,
    supprimerNouvelleAme,
    modifierNouvelleAme,
}
