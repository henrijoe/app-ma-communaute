import fs from "fs";
import path from "path";
import crypto from "crypto";
import { address as getIpAddress } from "ip";

import sqliteDB from "../../db/sqliteDB";
import {
  DESKTOP_SUPERADMIN_PASSWORD,
  DESKTOP_SUPERADMIN_USERNAME,
  SQLITE_REFERENCE_PASSWORD,
  SQLITE_SECURITY_NOTE,
} from "../../db/sqliteSecurity";

type DesktopLicenseConfig = {
  createdAt: string;
  expiresAt: string;
  manuallyBlocked: boolean;
  blockMessage: string;
  superAdminUsers: string[];
  lastUnlockedAt: string | null;
  lastUnlockedBy: string | null;
};

type DesktopLicenseStatus = {
  isBlocked: boolean;
  isSuperAdmin: boolean;
  expiresAt: string;
  manuallyBlocked: boolean;
  blockMessage: string;
  daysRemaining: number;
  sqliteReferencePassword: string;
  sqliteSecurityNote: string;
};

const DEFAULT_DESKTOP_TRIAL_DAYS = Number(process.env.DESKTOP_TRIAL_DAYS || 40);
const DEFAULT_DESKTOP_SUPERADMINS = (process.env.DESKTOP_SUPERADMINS || DESKTOP_SUPERADMIN_USERNAME)
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

const DESKTOP_LICENSE_FILE = path.join(
  sqliteDB.getSqliteDirectory(),
  ".desktop-license.secure"
);
// const DESKTOP_LICENSE_ALGORITHM = "aes-256-cbc";
// const DESKTOP_LICENSE_KEY = crypto.scryptSync(SQLITE_REFERENCE_PASSWORD, "ma-communaute-desktop", 32);
// const toUint8Array = (value: Buffer): Uint8Array => Uint8Array.from(value);

const DESKTOP_LICENSE_ALGORITHM = "aes-256-cbc";
const DESKTOP_LICENSE_KEY = crypto.scryptSync(
  SQLITE_REFERENCE_PASSWORD,
  "ma-communaute-desktop",
  32
);
const toUint8Array = (value: Buffer): Uint8Array => Uint8Array.from(value);


// Retourne la date ISO correspondant a maintenant + N jours.
const buildExpirationDate = (days: number): string => {
  // On part toujours de la date courante au moment de l'appel.
  const result = new Date();
  // On impose au minimum 1 jour pour eviter une expiration immediate par erreur.
  result.setDate(result.getDate() + Math.max(1, days));
  // On retourne une date ISO pour faciliter le stockage et les comparaisons.
  return result.toISOString();
};

// Normalise un nom utilisateur pour les comparaisons de securite.
const normalizeUsername = (value?: string): string =>
  // On vide les espaces et on passe en minuscule pour comparer toujours le meme format.
  (value || "").trim().toLowerCase();

// Chiffre la configuration de licence avant de l'ecrire localement.
const encryptDesktopLicenseConfig = (config: DesktopLicenseConfig): string => {
  // Chaque ecriture genere un IV aleatoire pour eviter un chiffrement trop previsible.
  const iv = crypto.randomBytes(16);
  // On cree le moteur de chiffrement avec l'algorithme choisi et la cle derivee du secret local.
  const cipher = crypto.createCipheriv(DESKTOP_LICENSE_ALGORITHM, toUint8Array(DESKTOP_LICENSE_KEY), toUint8Array(iv));
  // On serialise la configuration pour pouvoir la chiffrer comme un simple texte JSON.
  const serializedConfig = JSON.stringify(config);
  // On concatene les morceaux chiffres pour produire un seul bloc binaire complet.
  const encryptedContent = Buffer.concat([
    cipher.update(serializedConfig, "utf8"),
    cipher.final(),
  ]);

  // On stocke l'IV et le contenu chiffre en hex afin de les ecrire facilement dans un fichier texte.
  return JSON.stringify({
    iv: iv.toString("hex"),
    content: encryptedContent.toString("hex"),
  });
};

// Dechiffre le fichier local de licence pour retrouver les donnees internes.
const decryptDesktopLicenseConfig = (rawContent: string): DesktopLicenseConfig => {
  // On lit d'abord l'enveloppe JSON qui contient l'IV et le contenu chiffre.
  const parsedContent = JSON.parse(rawContent) as { iv: string; content: string };
  // On recree le moteur de dechiffrement avec le meme algorithme, la meme cle et l'IV stocke.
  const decipher = crypto.createDecipheriv(
    DESKTOP_LICENSE_ALGORITHM,
    toUint8Array(DESKTOP_LICENSE_KEY),
    toUint8Array(Buffer.from(parsedContent.iv, "hex"))
  );

  // On dechiffre le contenu puis on le retransforme en texte JSON lisible.
  const decryptedContent = Buffer.concat([
    decipher.update(toUint8Array(Buffer.from(parsedContent.content, "hex"))),
    decipher.final(),
  ]).toString("utf8");

  // On retourne enfin la configuration metier telle qu'elle avait ete stockee.
  return JSON.parse(decryptedContent) as DesktopLicenseConfig;
};

// Verifie si les identifiants recus correspondent au createur de l'application fixe du desktop.
export const isFixedDesktopSuperAdminCredentials = (
  nomUtilisateur?: string,
  password?: string
): boolean => {
  // On compare le nom normalise au createur de l'application configure en dur dans le projet.
  const isMatchingUsername =
    normalizeUsername(nomUtilisateur) === normalizeUsername(DESKTOP_SUPERADMIN_USERNAME);
  // Le mot de passe est compare tel quel car il sert ici de cle d'acces speciale.
  const isMatchingPassword = (password || "") === DESKTOP_SUPERADMIN_PASSWORD;

  // Les deux informations doivent correspondre pour reconnaitre le createur de l'application fixe.
  return isMatchingUsername && isMatchingPassword;
};

// Cree la configuration de licence minimale si aucun fichier n'existe encore.
const buildDefaultDesktopLicense = (seedSuperAdminUsername?: string): DesktopLicenseConfig => ({
  // La date de creation sert de point de depart historique pour la licence locale.
  createdAt: new Date().toISOString(),
  // L'expiration est automatiquement calculee sur la duree standard du desktop.
  expiresAt: buildExpirationDate(DEFAULT_DESKTOP_TRIAL_DAYS),
  // Par defaut, on ne bloque pas manuellement une licence nouvellement creee.
  manuallyBlocked: false,
  // Ce message sera reutilise si un blocage manuel est active plus tard.
  blockMessage:
    "Acces desktop temporairement bloque. Veuillez contacter le createur de l'application pour renouveler l'application.",
  // Si un nom est fourni au premier lancement, on l'utilise comme createur de l'application initial de la licence.
  superAdminUsers: seedSuperAdminUsername
    ? [normalizeUsername(seedSuperAdminUsername)]
    : DEFAULT_DESKTOP_SUPERADMINS,
  // Aucun debloquage n'a encore eu lieu a la creation de la licence.
  lastUnlockedAt: null,
  lastUnlockedBy: null,
});

// S'assure que le dossier SQLite existe pour stocker aussi la licence locale.
const ensureDesktopLicenseDirectory = async (): Promise<void> => {
  // On cree le dossier si besoin afin que l'ecriture du fichier de licence ne puisse pas echouer.
  await fs.promises.mkdir(sqliteDB.getSqliteDirectory(), { recursive: true });
};

// Lit la configuration locale de licence desktop en la creant au besoin.
const readDesktopLicenseConfig = async (
  seedSuperAdminUsername?: string
): Promise<DesktopLicenseConfig> => {
  // Avant toute lecture, on s'assure que le dossier de stockage existe bien.
  await ensureDesktopLicenseDirectory();

  if (!fs.existsSync(DESKTOP_LICENSE_FILE)) {
    // Si aucun fichier n'existe, on cree une licence par defaut immediate.
    const defaultConfig = buildDefaultDesktopLicense(seedSuperAdminUsername);
    // On ecrit aussitot cette licence sous forme chiffree pour initialiser le desktop local.
    await fs.promises.writeFile(DESKTOP_LICENSE_FILE, encryptDesktopLicenseConfig(defaultConfig), "utf-8");
    return defaultConfig;
  }

  // Si le fichier existe deja, on lit son contenu chiffre depuis le disque.
  const rawContent = await fs.promises.readFile(DESKTOP_LICENSE_FILE, "utf-8");
  // On dechiffre ensuite ce contenu pour retrouver la configuration courante.
  const parsedContent = decryptDesktopLicenseConfig(rawContent) as Partial<DesktopLicenseConfig>;
  // On garde une base par defaut pour completer les proprietes manquantes si besoin.
  const defaultConfig = buildDefaultDesktopLicense(seedSuperAdminUsername);

  return {
    // On part de la configuration par defaut pour garantir une structure complete.
    ...defaultConfig,
    // Puis on surcharge avec les valeurs effectivement stockees dans le fichier.
    ...parsedContent,
    // Enfin, on normalise toujours la liste des createur de l'applications pour garder des comparaisons fiables.
    superAdminUsers: Array.isArray(parsedContent.superAdminUsers)
      ? parsedContent.superAdminUsers.map((item) => normalizeUsername(item)).filter(Boolean)
      : defaultConfig.superAdminUsers,
  };
};

// Ecrit la configuration de licence desktop apres modification.
const writeDesktopLicenseConfig = async (config: DesktopLicenseConfig): Promise<void> => {
  // On recree le dossier si necessaire avant toute ecriture sur disque.
  await ensureDesktopLicenseDirectory();
  // On ecrit toujours la version chiffree, jamais la configuration brute.
  await fs.promises.writeFile(DESKTOP_LICENSE_FILE, encryptDesktopLicenseConfig(config), "utf-8");
};

// Indique si le nom utilisateur fourni fait partie des createur de l'applications autorises.
const isSuperAdminUser = (nomUtilisateur: string | undefined, config: DesktopLicenseConfig): boolean => {
  // On verifie d'abord la liste des createur de l'applications enregistres dans la licence locale.
  const isListedInLicense = config.superAdminUsers.includes(normalizeUsername(nomUtilisateur));
  // On garde aussi un acces de secours par le createur de l'application fixe du projet.
  const isFixedSuperAdmin =
    normalizeUsername(nomUtilisateur) === normalizeUsername(DESKTOP_SUPERADMIN_USERNAME);

  // Si l'une des deux conditions est vraie, l'utilisateur est traite comme createur de l'application.
  return isListedInLicense || isFixedSuperAdmin;
};

// Calcule le nombre de jours restants avant blocage automatique.
const computeDaysRemaining = (expiresAt: string): number => {
  // On convertit la date d'expiration en timestamp pour la comparer facilement a maintenant.
  const expirationDate = new Date(expiresAt).getTime();
  const now = Date.now();
  const difference = expirationDate - now;

  if (difference <= 0) {
    // Si la date est passee, on retourne 0 jour restant.
    return 0;
  }

  // Sinon, on arrondit au dessus pour afficher un nombre de jours restant plus parlant.
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};

// Retourne l'etat calcule de la licence desktop pour un utilisateur donne.
export const getDesktopLicenseStatus = async (
  nomUtilisateur?: string
): Promise<DesktopLicenseStatus> => {
  // On charge d'abord la licence actuellement stockee localement.
  const config = await readDesktopLicenseConfig(nomUtilisateur);
  // On determine si cet utilisateur a un droit createur de l'application.
  const isSuperAdmin = isSuperAdminUser(nomUtilisateur, config);
  // On verifie si la date de fin a deja ete depassee.
  const isExpired = new Date(config.expiresAt).getTime() <= Date.now();
  // On combine le blocage manuel et l'expiration pour produire l'etat brut de blocage.
  const rawBlocked = config.manuallyBlocked || isExpired;

  return {
    // Un createur de l'application reste autorise a entrer meme si la licence est techniquement bloquee.
    isBlocked: rawBlocked && !isSuperAdmin,
    isSuperAdmin,
    expiresAt: config.expiresAt,
    manuallyBlocked: config.manuallyBlocked,
    // Si la licence a expire, on renvoie un message explicite prioritaire sur le message manuel.
    blockMessage: isExpired
      ? "La licence desktop a expire. Seul le createur de l'application peut renouveler l'acces."
      : config.blockMessage,
    // On calcule les jours restants pour l'affichage dans le front.
    daysRemaining: computeDaysRemaining(config.expiresAt),
    // On expose aussi la reference de securite locale pour information d'administration.
    sqliteReferencePassword: SQLITE_REFERENCE_PASSWORD,
    sqliteSecurityNote: SQLITE_SECURITY_NOTE,
  };
};

// Initialise explicitement la licence locale si elle n'existe pas encore.
export const ensureDesktopLicenseInitialized = async (
  seedSuperAdminUsername?: string
): Promise<DesktopLicenseConfig> => {
  // Cette fonction reutilise simplement la lecture, qui sait deja creer la licence si besoin.
  return readDesktopLicenseConfig(seedSuperAdminUsername);
};

// Renouvelle l'acces desktop local apres verification du createur de l'application.
export const unlockDesktopLicense = async (payload: {
  nomUtilisateur: string;
  password: string;
  extendDays?: number;
}): Promise<DesktopLicenseStatus> => {
  // On lit la licence actuelle avant toute modification.
  const config = await readDesktopLicenseConfig(payload.nomUtilisateur);

  if (!isFixedDesktopSuperAdminCredentials(payload.nomUtilisateur, payload.password)) {
    // Le renouvellement manuel n'est autorise qu'au superadmin fixe du projet.
    throw new Error("Seul le superadmin fixe peut debloquer l'application desktop.");
  }

  const nextConfig: DesktopLicenseConfig = {
    // On repart de la configuration courante pour ne perdre aucune information utile.
    ...config,
    // Le debloquage retire explicitement le blocage manuel.
    manuallyBlocked: false,
    // On recalcule une nouvelle date d'expiration a partir du nombre de jours demande.
    expiresAt: buildExpirationDate(payload.extendDays || DEFAULT_DESKTOP_TRIAL_DAYS),
    // On trace la date et l'auteur du dernier debloquage pour le suivi administratif.
    lastUnlockedAt: new Date().toISOString(),
    lastUnlockedBy: payload.nomUtilisateur,
  };

  // On reecrit la licence mise a jour dans le fichier chiffre local.
  await writeDesktopLicenseConfig(nextConfig);
  // On retourne ensuite le nouvel etat complet attendu par le front.
  return getDesktopLicenseStatus(payload.nomUtilisateur);
};

// Expose l'IP reseau du serveur pour que le front affiche une URL LAN meme en dev.
export const getServerNetworkInfo = () => {
  // On detecte l'IP reseau courante de la machine qui heberge le backend.
  const ipAddress = getIpAddress();
  // On reutilise le port du serveur actif, ou 49300 si rien n'est force dans l'environnement.
  const port = Number(process.env.PORT || 49300);

  return {
    ipAddress,
    port,
    // On prepare directement l'URL LAN complete attendue par le front et Electron.
    browserUrl: `http://${ipAddress}:${port}`,
  };
};

export default {
  ensureDesktopLicenseInitialized,
  getDesktopLicenseStatus,
  unlockDesktopLicense,
  getServerNetworkInfo,
  isFixedDesktopSuperAdminCredentials,
};






