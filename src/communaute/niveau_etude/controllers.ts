import { Request, Response, Errback } from "express";
import services from "./services";

/**
 * Récupérer un membre
 * @returns 
 */
const obtenirIdNiveauEtude = (req: Request, res: Response) => {
    services
        .obtenirIdNiveauEtude()
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const ajouterNiveauEtude = (req: Request, res: Response) => {
    const data = req.body
    const io = (req as any).io;
    services
        .ajouterNiveauEtude(data)
        .then((result: any) => {
          if(result) {
            res.status(200).send({ status: 1, data: result });
          } else {
            res.status(400).send({status:0, errors:'Niveau non ajouter'})
          }
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};


const supprimerNiveau = (req: Request, res: Response) => {
    const { idNiveauEtude } = req.body
    services
      .supprimerNiveau(idNiveauEtude)
      .then((result: any) => {
        if (result) {
          res.status(200).send({ status: 1, data: result })
        } else {
          res.status(400).send({ status: 0, errors: 'Niveau non trouvé' })
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}


const modifierNiveau = (req: Request, res: Response) => {
    const data = req.body
    services
      .modifierNiveau(data)
      .then((result: any) => {
        res.status(200).send({ status: 1, data: result })
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }



export default {
    obtenirIdNiveauEtude,
    ajouterNiveauEtude,
    supprimerNiveau,
    modifierNiveau
}
