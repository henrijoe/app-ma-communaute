import { Request, Response, Errback } from "express";
import services from "./services";

const ajouterResponsabilite = (req: Request, res: Response) => {
    const data = req.body
    const io = (req as any).io;
    services
        .ajouterResponsabilite(data)
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

/**
 * Récupérer une departement
 * @returns 
 */
const recupResponsabilite = (req: Request, res: Response) => {
    services
        .recupResponsabilite()
        .then((result: any) => {
            // console.log("🚀 ~ .then ~ result--------------:", result)
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerResponsabilite = (req: Request, res: Response) => {
    const { idResponsabilite } = req.body
    services
      .supprimerResponsabilite(idResponsabilite)
      .then((result: any) => {
        if (result) {
          res.status(200).send({ status: 1, data: result })
        } else {
          res.status(400).send({ status: 0, errors: 'Responsabilité non trouvé'})
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}
  
const modifierResponsabilite = (req: Request, res: Response) => {
    const data = req.body
    services
      .modifierResponsabilite(data)
      .then((result: any) => {
        res.status(200).send({ status: 1, data: result })
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }

export default {
    ajouterResponsabilite,
    recupResponsabilite,
    supprimerResponsabilite,
    modifierResponsabilite,
}
