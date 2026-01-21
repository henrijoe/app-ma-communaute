import { Request, Response, Errback } from "express";
import services from "./services";


const ajouterMariage = (req: Request, res: Response) => {
  const data = req.body
  console.log("🚀 ~ ajouterMariage ~ data:", data)
  const io = (req as any).io;
  services
    .ajouterMariage(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => {
      if (error.message.includes('Ce mariage existe déjà.')) {
        res.status(400).send({ status: 0, error: error.message });
      } else {
        res.status(400).send({ status: 0, error });
      }
    });
};


/**
 * Récupérer une mariage
 * @returns 
 */
const recupMariage = (req: Request, res: Response) => {
  services
    .recupMariage()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerMariage = (req: Request, res: Response) => {
  const { idMariage } = req.body
  services
    .supprimerMariage(idMariage)
    .then((result: any) => {
      if (result) {
        res.status(200).send({ status: 1, data: result })
      } else {
        res.status(400).send({ status: 0, errors: 'Mariage non trouvé' })
      }
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const modifierMariage = (req: Request, res: Response) => {
  const data = req.body
  services
    .modifierMariage(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result })
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const recupMariageByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req?.params
  services
    .recupMariageByIdUtilsateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};


export default {
  recupMariage,
  ajouterMariage,
  supprimerMariage,
  modifierMariage,
  recupMariageByIdUtilsateur
}
