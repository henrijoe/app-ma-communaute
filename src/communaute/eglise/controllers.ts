import { Request, Response, Errback } from "express";
import services from "./services";


const ajouterEglise = (req: Request, res: Response) => {
    const data = req.body
    const io = (req as any).io;
    services
        .ajouterEglise(data)
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

/**
 * Récupérer une eglise
 * @returns 
 */
const recupEglise = (req: Request, res: Response) => {
    services
        .recupEglise()
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerEglise = (req: Request, res: Response) => {
    const { idEglise } = req.body
    services
      .supprimerEglise(idEglise)
      .then((result: any) => {
        if (result) {
          res.status(200).send({ status: 1, data: result })
        } else {
          res.status(400).send({ status: 0, errors: 'Eglise non trouvé' })
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}
  
const modifierEglise = (req: Request, res: Response) => {
    const data = req.body
    services
      .modifierEglise(data)
      .then((result: any) => {
        res.status(200).send({ status: 1, data: result })
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }

export default {
    recupEglise,
    ajouterEglise,
    supprimerEglise,
    modifierEglise,
}
