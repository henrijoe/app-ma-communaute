import { Request, Response, Errback } from "express";
import services from "./services";


const ajouterDepartement = (req: Request, res: Response) => {
  const data = req.body;
  const io = (req as any).io;
  services
    .ajouterDepartement(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => {
      if (error.message.includes('Ce département existe déjà.')) {
        res.status(400).send({ status: 0, error: error.message });
      } else {
        res.status(400).send({ status: 0, error });
      }
    });
};


/**
 * Récupérer une departement
 * @returns 
 */
const recupDepartement = (req: Request, res: Response) => {
    services
        .recupDepartement()
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const recupDepartementByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req?.params
  services
      .recupDepartementByIdUtilsateur(idUtilisateur)
      .then((result: any) => {
          res.status(200).send({ status: 1, data: result });
      })
      .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerDepartement = (req: Request, res: Response) => {
    const { idDepartement } = req.body
    services
      .supprimerDepartement(idDepartement)
      .then((result: any) => {
        if (result) {
          res.status(200).send({ status: 1, data: result })
        } else {
          res.status(400).send({ status: 0, errors: 'Departement non trouvé' })
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}
  
const modifierDepartement = (req: Request, res: Response) => {
    const data = req.body
    // console.log("🚀 ~ modifierDepartement ~ data:", data)
    services
      .modifierDepartement(data)
      .then((result: any) => {
        res.status(200).send({ status: 1, data: result })
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }

export default {
    ajouterDepartement,
    recupDepartement,
    supprimerDepartement,
    modifierDepartement,
    recupDepartementByIdUtilsateur
}
