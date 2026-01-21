import { Request, Response, Errback } from "express";
import services from "./services";

const ajouterMembre = (req: Request, res: Response) => {
    const data = req.body
    const io = (req as any).io;
    services
        .ajouterMembre(data)
        .then((result: any) => {
          (req as any).io.emit("ajouterMembre", result)
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

/**
 * Récupérer un membre
 * @returns 
 */
const recupMembre = (req: Request, res: Response) => {
    services
        .recupMembre()
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerMembre = (req: Request, res: Response) => {
    const { idMembre } = req.body
    services
      .supprimerMembre(idMembre)
      .then((result: any) => {
        if (result) {
          (req as any).io.emit("supprimerMembre", result)
          res.status(200).send({ status: 1, data: result})
        } else {
          res.status(400).send({ status: 0, errors: 'Membre non trouvé' })
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}
  
const modifierMembre = (req: Request, res: Response) => {
    const data = req.body
    services
      .modifierMembre(data)
      .then((result: any) => {
        (req as any).io.emit("modifierMembre",result)
        res.status(200).send({ status: 1, data:result})
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }

  const recupMembreByIdUtilsateur = (req: Request, res: Response) => {
    const { idUtilisateur } = req?.params
    services
        .recupMembreByIdUtilsateur(idUtilisateur)
        .then((result: any) => {
            //  (req as any).io.emit("recupmembrebyutilisateur", result)
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};


export default {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreByIdUtilsateur
}
