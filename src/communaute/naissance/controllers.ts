import { Request, Response, Errback } from "express";
import services from "./services";


const ajouterNaissance = (req: Request, res: Response) => {
  const data = req.body
  console.log("🚀 ~ ajouterNaissance ~ data:", data)
  const io = (req as any).io;
  services
    .ajouterNaissance(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => {
      if (error.message.includes('Ce cas de naissance à déjà ètè enregistré.')) {
        res.status(400).send({ status: 0, error: error.message });
      } else {
        res.status(400).send({ status: 0, error });
      }
    });
};


/**
 * Récupérer une naissance
 * @returns 
 */
const recupNaissance = (req: Request, res: Response) => {
  services
    .recupNaissance()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerNaissance = (req: Request, res: Response) => {
  const { idNaissance } = req.body
  services
    .supprimerNaissance(idNaissance)
    .then((result: any) => {
      if (result) {
        res.status(200).send({ status: 1, data: result })
      } else {
        res.status(400).send({ status: 0, errors: 'Naissance non trouvée' })
      }
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const modifierNaissance = (req: Request, res: Response) => {
  const data = req.body
  services
    .modifierNaissance(data)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result })
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const recupNaissanceByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req?.params
  services
    .recupNaissanceByIdUtilsateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};


export default {
  recupNaissance,
  ajouterNaissance,
  supprimerNaissance,
  modifierNaissance,
  recupNaissanceByIdUtilsateur
}
