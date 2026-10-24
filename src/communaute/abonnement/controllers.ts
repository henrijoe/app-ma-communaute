import { Request, Response } from "express";

import { RequeteAuthentifiee } from "../authentification";
import { errorMsg } from "../functions";
import saspay from "./saspay";
import services from "./services";

/** Ouvre une souscription et renvoie l'URL de paiement (page hébergée SasPay). */
const souscrire = async (req: Request, res: Response) => {
  try {
    const { idUtilisateur, plan, emailClient, nomClient, telephoneClient, urlRetour } = req.body;
    const resultat = await services.demarrerSouscription({
      idUtilisateur: Number(idUtilisateur),
      plan,
      emailClient,
      nomClient,
      telephoneClient,
      urlRetour,
    });

    res.status(200).send({ status: 1, data: resultat });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

/**
 * Demande à SasPay où en est le paiement, et active si c'est réglé.
 * À appeler au retour du client depuis la page de paiement, ou depuis un bouton
 * « J'ai payé » : c'est ce qui permet de fonctionner sans webhook.
 */
const verifier = async (req: Request, res: Response) => {
  try {
    const resultat = await services.verifierEtActiver(String(req.params.reference || ""));
    res.status(200).send({ status: 1, data: resultat });
  } catch (error) {
    res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

/** État de l'abonnement d'un compte : affiché dans Paramètres et lu à la connexion. */
const etat = async (req: Request, res: Response) => {
  try {
    const idUtilisateur = Number(req.params.idUtilisateur);
    const auth = (req as RequeteAuthentifiee).auth;

    // Le middleware ne reconnaît le périmètre que sur les chemins en "byutilisateur/"
    // ou dans le corps : ici l'identifiant est un simple segment, donc on le vérifie.
    if (auth && !auth.superadmin && idUtilisateur !== auth.scope && idUtilisateur !== auth.idUtilisateur) {
      return res.status(403).send({
        status: 0,
        error: {
          name: "PERIMETRE_INTERDIT",
          message: "Vous n'avez pas accès à l'abonnement de ce compte.",
        },
      });
    }

    return res.status(200).send({ status: 1, data: await services.etatAbonnement(idUtilisateur) });
  } catch (error) {
    return res.status(400).send({ status: 0, error: errorMsg(error) });
  }
};

/**
 * Point d'entrée des notifications SasPay.
 *
 * Le corps arrive ici en Buffer brut (voir le montage dans app.ts) : la signature se
 * calcule sur les octets reçus, pas sur un JSON reconstruit.
 *
 * On répond 200 dès que la signature est valide, même si l'événement ne nous concerne
 * pas : un code d'erreur déclencherait cinq réémissions inutiles.
 */
const webhook = async (req: Request, res: Response) => {
  const corpsBrut = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body || "");

  const verification = saspay.signatureWebhookValide({
    corpsBrut,
    signature: req.header("X-Webhook-Signature") || undefined,
    horodatage: req.header("X-Webhook-Timestamp") || undefined,
  });

  if (!verification.valide) {
    console.warn(`[abonnement] webhook rejeté : ${verification.motif}`);
    return res.status(401).send({ status: 0, error: { name: "SIGNATURE_INVALIDE" } });
  }

  try {
    const evenement = JSON.parse(corpsBrut);
    const resultat = await services.traiterEvenement(evenement);
    console.info(`[abonnement] webhook ${evenement?.event} : ${resultat.motif}`);
    return res.status(200).send({ status: 1, data: resultat });
  } catch (error: any) {
    // On trace sans relancer : l'événement est authentique, le rejouer ne réparerait rien.
    console.error(`[abonnement] traitement du webhook impossible : ${error?.message || error}`);
    return res.status(200).send({ status: 1, data: { traite: false, motif: "erreur interne" } });
  }
};

export default { souscrire, verifier, etat, webhook };
