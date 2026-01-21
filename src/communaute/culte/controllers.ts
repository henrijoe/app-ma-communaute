import { Request, Response, Errback } from "express";
import services from "./services";


const ajouterCulte = (req: Request, res: Response) => {
  const data = req.body
  // console.log("🚀 ~ ajouterCulte ~ data:", data)
  const io = (req as any).io;
  services
    .ajouterCulte(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => {
      if (error.message.includes('Ce culte existe déjà.')) {
        res.status(400).send({ status: 0, error: error.message });
      } else {
        res.status(400).send({ status: 0, error });
      }
    });
};


/**
 * Récupérer une cellule
 * @returns 
 */
const recupCulte = (req: Request, res: Response) => {
  services
    .recupCulte()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerCulte = (req: Request, res: Response) => {
  const { idCulte } = req.body
  services
    .supprimerCulte(idCulte)
    .then((result: any) => {
      if (result) {
        res.status(200).send({ status: 1, data: result })
      } else {
        res.status(400).send({ status: 0, errors: 'Culte non trouvée' })
      }
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const modifierCulte = (req: Request, res: Response) => {
  const data = req.body
  services
    .modifierCulte(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result })
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const recupCulteByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req?.params
  services
    .recupCulteByIdUtilsateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};


export default {
  recupCulte,
  ajouterCulte,
  supprimerCulte,
  modifierCulte,
  recupCulteByIdUtilsateur
}
