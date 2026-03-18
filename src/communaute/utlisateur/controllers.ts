import { Request, Response, Errback } from "express";
import services from "./services";
import { errorMsg } from "../functions";
const uuid = require("uuid")


const ajouterUtilisateur = (req: Request, res: Response) => {
    const data = req.body
    const io = (req as any).io;
    services
        .ajouterUtilisateur(data)
        .then((result: any) => {
          (req as any).io.emit("ajouterUtilisateur", result)
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

/**
 * Cree la base SQLite physique de la communaute dans le dossier cible.
 */
const creerBaseSqlite = (req: Request, res: Response) => {
    const data = req.body
    services
        .creerBaseSqlite(data)
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const recupUtilisateur = (req: Request, res: Response) => {
  services
      .recupUtilisateur()
      .then((result: any) => {
          res.status(200).send({ status: 1, data: result });
      })
      .catch((error: any) => res.status(400).send({ status: 0, error }));
};


const supprimerUtilisateur = (req: Request, res: Response) => {
    const { idUtilisateur } = req.body
    services
      .supprimerUtilisateur(idUtilisateur)
      .then((result: any) => {
        if (result) {
          (req as any).io.emit("supprimerUtilisateur", result)
          res.status(200).send({ status: 1, data: result })
        } else {
          res.status(400).send({ status: 0, errors: 'Utilisateur non trouvé' })
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const modifierUtilisateur = (req: Request, res: Response) => {
    const data = req.body
    services
      .modifierUtilisateur(data)
      .then((result: any) => {
        (req as any).io.emit("modifierUtilisateur",result)
        res.status(200).send({ status: 1, data: result })
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }


  const connexionUtilisateur = async (req: Request, res: Response) => {
    try {
        // Récupérez les données du corps de la requête
        const { nomUtilisateur, motDePasse } = req.body;

        // Appelez la fonction connexionUtilisateur avec les données fournies
        const utilisateur = await services.connexionUtilisateur(nomUtilisateur, motDePasse);
        // console.log("🚀 ~ connexionUtilisateur ~ utilisateur:", utilisateur)

        // Renvoyez la réponse avec le statut 200 et les données de l'utilisateur
        res.status(200).send({ status: 1, data: utilisateur });
    } catch (error) {
        console.error(error);
        res.status(400).send({ status: 0, error: errorMsg(error) });
    }
};

  const login = async (req: Request, res: Response) => {
    try {
        // Récupérez les données du corps de la requête
        const data = req.body;
        // console.log("🚀 ~ login ~ data:", data)

        // Appelez la fonction login avec les données fournies
        const result = await services.login(data);
        // console.log("🚀 ~ login ~ result:", result)

        // Renvoyez la réponse avec le statut 200 et les données de l'utilisateur
        res.status(200).send({ status: 1, data: result });
    } catch (error) {
        // Gérez les erreurs et renvoyez des messages d'erreur appropriés
        console.error(error);
        res.status(400).send({ status: 0, error: errorMsg(error) });
    }
};

/**
 * reinitilaiser le mot de passe d'un utilisateur
 * @param req 
 * @param res 
 */
// export const reinitialiserLogin = (req: any, res: Response) => {
//   const data = req.body
//   services
//       .modifierMotDePasse(data, "reinitialiser")
//       .then((result: any) => {
//           req.io.emit('utilisateur_modifie', result)
//           res.status(200).send({ status: 1, data: result })

//       })
//       .catch((error: any) => res.status(400).send({ status: 0, error }));
// };


export default {
  ajouterUtilisateur,
    creerBaseSqlite,
    recupUtilisateur,
    supprimerUtilisateur,
    modifierUtilisateur,
    connexionUtilisateur,
    login
}
