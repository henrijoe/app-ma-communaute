import { Request, Response, Errback } from "express";
import services from "./services";


const ajouterDeces = (req: Request, res: Response) => {
  const data = req.body
  console.log("🚀 ~ ajouterDeces ~ data:", data)
  const io = (req as any).io;
  services
    .ajouterDeces(data)
    .then((result: any) => {
      io.emit('ajouterDeces', {
        idUtilisateur: data?.idUtilisateur || null,
        idMembre: data?.idMembre || null,
        nomMembreDeces: data?.nomMembreDeces || result?.[0]?.nomMembreDeces || '',
        dateDeces: data?.dateDeces || result?.[0]?.dateDeces || null,
        data: result,
      });
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => {
      if (error.message.includes('Ce cas de déces à  déjà enregistré.')) {
        res.status(400).send({ status: 0, error: error.message });
      } else {
        res.status(400).send({ status: 0, error });
      }
    });
};


/**
 * Récupérer une deces
 * @returns 
 */
const recupDeces = (req: Request, res: Response) => {
  services
    .recupDeces()
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const supprimerDeces = (req: Request, res: Response) => {
  const { idDeces } = req.body
  services
    .supprimerDeces(idDeces)
    .then((result: any) => {
      if (result) {
        (req as any).io.emit('supprimerDeces', result)
        res.status(200).send({ status: 1, data: result })
      } else {
        res.status(400).send({ status: 0, errors: 'Deces non trouvée' })
      }
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const modifierDeces = (req: Request, res: Response) => {
  const data = req.body
  services
    .modifierDeces(data)
    .then((result: any) => {
      (req as any).io.emit('modifierDeces', {
        idUtilisateur: data?.idUtilisateur || null,
        idMembre: data?.idMembre || null,
        nomMembreDeces: data?.nomMembreDeces || '',
        dateDeces: data?.dateDeces || null,
        data: result,
      })
      res.status(200).send({ status: 1, data: result })
    })
    .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const recupDecesByIdUtilsateur = (req: Request, res: Response) => {
  const { idUtilisateur } = req?.params
  services
    .recupDecesByIdUtilsateur(idUtilisateur)
    .then((result: any) => {
      res.status(200).send({ status: 1, data: result });
    })
    .catch((error: any) => res.status(400).send({ status: 0, error }));
};


export default {
  recupDeces,
  ajouterDeces,
  supprimerDeces,
  modifierDeces,
  recupDecesByIdUtilsateur
}
