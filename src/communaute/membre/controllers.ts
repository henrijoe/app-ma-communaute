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
        .catch((error: any) => res.status(400).send({
            status: 0,
            error,
            message: error?.message || 'Erreur lors de la creation du membre',
        }));
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
    const { idMembre, idUtilisateur } = req.body
    services
      .supprimerMembre(idMembre, idUtilisateur)
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
      .catch((errors: any) => res.status(400).send({
        status: 0,
        errors,
        message: errors?.message || 'Erreur lors de la modification du membre',
      }))
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


const ajouterDemandeInscriptionMembre = (req: Request, res: Response) => {
    services
        .ajouterDemandeInscriptionMembre(req.body)
        .then((result: any) => {
            (req as any).io.emit("demandeInscriptionMembre", result);
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({
            status: 0,
            error,
            message: error?.message || "Erreur lors de l'enregistrement de la demande d'inscription",
        }));
};

const recupDemandesInscriptionMembreByUtilisateur = (req: Request, res: Response) => {
    const { idUtilisateur } = req.params;
    services
        .recupDemandesInscriptionMembreByUtilisateur(Number(idUtilisateur))
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};

const validerDemandeInscriptionMembre = (req: Request, res: Response) => {
    const { idDemandeInscription, idUtilisateur } = req.body;
    services
        .validerDemandeInscriptionMembre(idDemandeInscription, idUtilisateur)
        .then((result: any) => {
            (req as any).io.emit("ajouterMembre", result);
            (req as any).io.emit("demandeInscriptionMembreTraitee", result);
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({
            status: 0,
            error,
            message: error?.message || "La demande n'a pas pu etre validee",
        }));
};

const rejeterDemandeInscriptionMembre = (req: Request, res: Response) => {
    const { idDemandeInscription, idUtilisateur } = req.body;
    services
        .rejeterDemandeInscriptionMembre(idDemandeInscription, idUtilisateur)
        .then((result: any) => {
            (req as any).io.emit("demandeInscriptionMembreTraitee", result);
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({
            status: 0,
            error,
            message: error?.message || "La demande n'a pas pu etre rejetee",
        }));
};

export default {
    recupMembre,
    ajouterMembre,
    supprimerMembre,
    modifierMembre,
    recupMembreByIdUtilsateur,
    ajouterDemandeInscriptionMembre,
    recupDemandesInscriptionMembreByUtilisateur,
    validerDemandeInscriptionMembre,
    rejeterDemandeInscriptionMembre,
}

