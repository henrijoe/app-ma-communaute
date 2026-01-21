import { Request, Response, Errback } from "express";
import services from "./services";

const ajouterDomaineActivite = (req: Request, res: Response) => {
  const data = req.body
  const io = (req as any).io;
  services
      .ajouterDomaineActivite(data)
      .then((result: any) => {
          res.status(200).send({ status: 1, data: result });
      })
      .catch((error: any) => res.status(400).send({ status: 0, error }));
};


const obtenirDomaineActivite = (req: Request, res: Response) => {
    services
        .obtenirDomaineActivite()
        .then((result: any) => {
            res.status(200).send({ status: 1, data: result });
        })
        .catch((error: any) => res.status(400).send({ status: 0, error }));
};


const supprimerDomaineActivite = (req: Request, res: Response) => {
    const { idDomaineActivite } = req.body
    services
      .supprimerDomaineActivite(idDomaineActivite)
      .then((result: any) => {
        if (result) {
          res.status(200).send({ status: 1, data: result })
        } else {
          res.status(400).send({ status: 0, errors: 'Domaine non trouvé' })
        }
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
}

const modifierDomaineActivite = (req: Request, res: Response) => {
    const data = req.body
    services
      .modifierDomaineActivite(data)
      .then((result: any) => {
        res.status(200).send({ status: 1, data: result })
      })
      .catch((errors: any) => res.status(400).send({ status: 0, errors }))
  }

export default {
    ajouterDomaineActivite,
    obtenirDomaineActivite,
    supprimerDomaineActivite,
    modifierDomaineActivite
}
