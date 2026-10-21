// Émission et vérification des jetons d'accès (JWT).
//
// Jusqu'ici l'API ne vérifiait rien : l'identité arrivait du client, et n'importe qui
// pouvait appeler /communaute/recupmembrebyutilisateur/3 sans être connecté. Le jeton
// est délivré à la connexion et vérifié par le middleware d'authentification.

import jwt from "jsonwebtoken";

import { SQLITE_REFERENCE_PASSWORD } from "../db/sqliteSecurity";

// En production on impose JWT_SECRET. À défaut, on dérive une valeur stable de la
// référence locale : une installation de poste fonctionne ainsi sans configuration,
// et les jetons survivent à un redémarrage (contrairement à un secret aléatoire).
const SECRET: string = process.env.JWT_SECRET || `ma-communaute:${SQLITE_REFERENCE_PASSWORD}`;
const DUREE = process.env.JWT_EXPIRES_IN || "12h";

export type ContenuJeton = {
  /** Identifiant du compte connecté. 0 pour le superadmin fixe. */
  idUtilisateur: number;
  /**
   * Périmètre de données : le compte parent pour un utilisateur secondaire, sinon
   * l'utilisateur lui-même. C'est cette valeur que les routes doivent respecter.
   */
  scope: number;
  nomUtilisateur: string;
  role: string;
  /** Le superadmin fixe n'est borné à aucune église. */
  superadmin: boolean;
};

export const signerJeton = (contenu: ContenuJeton): string =>
  jwt.sign(contenu, SECRET, { expiresIn: DUREE } as jwt.SignOptions);

/** Retourne le contenu du jeton, ou null s'il est absent, expiré ou falsifié. */
export const verifierJeton = (jeton: string): ContenuJeton | null => {
  try {
    return jwt.verify(jeton, SECRET) as ContenuJeton;
  } catch (_error) {
    return null;
  }
};

/** Extrait le jeton d'un en-tête "Authorization: Bearer <jeton>". */
export const lireJetonEntete = (entete?: string): string => {
  if (!entete) {
    return "";
  }

  const [type, valeur] = String(entete).split(" ");
  return type?.toLowerCase() === "bearer" && valeur ? valeur.trim() : "";
};
