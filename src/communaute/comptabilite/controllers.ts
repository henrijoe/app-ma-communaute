import { Request, Response, Errback } from "express";
import services from "./services";


const ajouterComptablilite = (req: Request, res: Response) => {
    const data = req.body
    const io = (req as any).io;
    services
       .ajouterComptablilite(data)
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

/**
 * Récupérer une comptabilite
 * @returns 
 */
const recupComptabilite = (req: Request, res: Response) => {
    services
        .recupComptabilite()
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerComptabilite = (req: Request, res: Response) => {
    const { idComptabilite } = req.body
    services
      .supprimerComptabilite(idComptabilite)
      .then((result: any) => {
        if (result) {
          res.status(200).send({ status: 1, data: result })
        } else {
          res.status(400).send({ status: 0, errors: 'Comptabilite non trouvé' })
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}
  
const modifierComptabilite = (req: Request, res: Response) => {
    const data = req.body
    services
      .modifierComptabilite(data)
      .then((result: any) => {
        res.status(200).send({ status: 1, data: result })
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }


export default {
    ajouterComptablilite,
    recupComptabilite,
    supprimerComptabilite,
    modifierComptabilite,
}
