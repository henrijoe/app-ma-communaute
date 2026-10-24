// Middleware d'authentification de l'API.
//
// Monté devant le routeur /communaute, il fait deux choses :
//   1. il exige un jeton valide, sauf sur les routes listées comme publiques ;
//   2. il vérifie que le périmètre demandé correspond à celui du jeton, pour qu'un
//      compte ne puisse pas lire les données d'une autre église en changeant le
//      numéro dans l'URL.

import { NextFunction, Request, Response } from "express";

import { ContenuJeton, lireJetonEntete, verifierJeton } from "../helpers/jetons";

export type RequeteAuthentifiee = Request & { auth?: ContenuJeton };

/**
 * Routes accessibles sans jeton, parce qu'elles servent justement à en obtenir un
 * ou qu'elles sont ouvertes par nature (inscription publique par QR code).
 * Toute route absente de cette liste exige un jeton.
 */
const ROUTES_PUBLIQUES: RegExp[] = [
  /^\/login$/,
  /^\/ajouterutilisateur$/, // création du compte à l'inscription
  /^\/creer-base-sqlite$/,
  /^\/inserereglise$/, // église créée dans la foulée de l'inscription
  /^\/demander-reset-password$/,
  /^\/reinitialiser-password$/,
  /^\/demandeinscriptionmembre$/, // fiche envoyée par le QR code public
  /^\/demandeinscriptionenfant$/, // fiche enfant envoyée par le QR code public
  /^\/listeutilisateurparent\/\d+$/, // choix du compte sur l'écran de connexion
  /^\/desktop-control\/status$/, // état de licence, lu avant connexion
  /^\/desktop-control\/unlock-code$/, // déblocage par code depuis l'écran bloqué
  // Notification de paiement : appelée par les serveurs SasPay, qui n'ont pas de
  // jeton applicatif. Son authenticité repose sur la signature HMAC du webhook.
  /^\/abonnement\/webhook$/,
];

const estPublique = (chemin: string): boolean =>
  ROUTES_PUBLIQUES.some((motif) => motif.test(chemin));

/**
 * Récupère le périmètre demandé par la requête, quand il est explicite :
 * segment d'URL ".../byutilisateur/12", paramètre ?idUtilisateur=12, ou champ
 * idUtilisateur du corps. Retourne null quand la route ne le précise pas.
 */
const perimetreDemande = (req: Request): number | null => {
  const depuisUrl = req.path.match(/(?:byutilisateur|utilisateur|parent)\/(\d+)/i);

  if (depuisUrl) {
    return Number(depuisUrl[1]);
  }

  const brut = (req.query?.idUtilisateur ?? (req.body as any)?.idUtilisateur) as unknown;
  const valeur = Number(brut);

  return Number.isFinite(valeur) && String(brut ?? "").trim() !== "" ? valeur : null;
};

export const authentification = (req: Request, res: Response, next: NextFunction) => {
  if (estPublique(req.path)) {
    return next();
  }

  const jeton = lireJetonEntete(req.headers.authorization);
  const contenu = jeton ? verifierJeton(jeton) : null;

  if (!contenu) {
    // 401 : le front le traduit déjà par "Votre session a expiré..." et renvoie
    // l'utilisateur vers l'écran de connexion.
    return res.status(401).send({
      status: 0,
      error: {
        name: "NON_AUTHENTIFIE",
        message: "Votre session a expiré. Reconnectez-vous pour continuer.",
      },
    });
  }

  (req as RequeteAuthentifiee).auth = contenu;

  // Le superadmin fixe administre tous les postes : il n'est borné à aucun périmètre.
  if (!contenu.superadmin) {
    const demande = perimetreDemande(req);

    if (demande !== null && demande !== contenu.scope && demande !== contenu.idUtilisateur) {
      return res.status(403).send({
        status: 0,
        error: {
          name: "PERIMETRE_INTERDIT",
          message: "Vous n'avez pas accès aux données de ce compte.",
        },
      });
    }
  }

  return next();
};

export default authentification;
