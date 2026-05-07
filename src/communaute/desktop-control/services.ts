import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import { execFileSync } from "child_process";
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
  unlockCodes: DesktopUnlockCodeRecord[];
  pendingPlainUnlockCodes: DesktopUnlockCodePlain[];
  lastUnlockCodesGeneratedAt: string | null;
  lastUnlockCodesExportedAt: string | null;
  machineBinding: DesktopMachineBinding;
};

type DesktopLicenseStatus = {
  isBlocked: boolean;
  isSuperAdmin: boolean;
  expiresAt: string;
  manuallyBlocked: boolean;
  blockMessage: string;
  daysRemaining: number;
  unlockCodeStats: DesktopUnlockCodeStats;
  machineBinding: DesktopMachineBindingStatus;
  sqliteReferencePassword: string;
  sqliteSecurityNote: string;
};

type DesktopMachineBinding = {
  fingerprintHash: string;
  description: string;
  boundAt: string;
};

type DesktopMachineBindingStatus = {
  isCurrentMachine: boolean;
  description: string;
  currentDescription: string;
  boundAt: string | null;
};

type DesktopUnlockCodeRecord = {
  id: string;
  codeHash: string;
  label: string;
  durationDays: number;
  createdAt: string;
  usedAt: string | null;
  usedBy: string | null;
};

type DesktopUnlockCodePlain = {
  id: string;
  code: string;
  label: string;
  durationDays: number;
  createdAt: string;
};

type DesktopUnlockCodeStats = {
  total: number;
  available: number;
  used: number;
  pendingExport: number;
};

type DesktopUnlockCodePack = {
  records: DesktopUnlockCodeRecord[];
  plainCodes: DesktopUnlockCodePlain[];
};

type DesktopUnlockCodeExport = {
  codes: DesktopUnlockCodePlain[];
  stats: DesktopUnlockCodeStats;
  exportedAt: string;
};

const DEFAULT_DESKTOP_TRIAL_DAYS = Number(process.env.DESKTOP_TRIAL_DAYS || 15);
const DEFAULT_DESKTOP_SUPERADMINS = (process.env.DESKTOP_SUPERADMINS || DESKTOP_SUPERADMIN_USERNAME)
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);
const DESKTOP_UNLOCK_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DESKTOP_UNLOCK_CODE_PLANS = [
  { label: "Forfait 30 jours", durationDays: 30, quantity: 10 },
  { label: "Forfait 60 jours", durationDays: 60, quantity: 5 },
  { label: "Forfait 6 mois", durationDays: 180, quantity: 5 },
  { label: "Forfait 1 an", durationDays: 365, quantity: 5 },
];

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

// Ajoute un forfait a l'expiration existante si elle est encore active, sinon repart d'aujourd'hui.
const buildExtendedExpirationDate = (currentExpiresAt: string, days: number): string => {
  const currentExpirationTime = new Date(currentExpiresAt).getTime();
  const baseDate =
    currentExpiresAt && !Number.isNaN(currentExpirationTime) && currentExpirationTime > Date.now()
      ? new Date(currentExpirationTime)
      : new Date();

  baseDate.setDate(baseDate.getDate() + Math.max(1, days));
  return baseDate.toISOString();
};

const getWindowsMachineGuid = (): string => {
  if (process.platform !== "win32") {
    return "";
  }

  try {
    const output = execFileSync(
      "reg",
      ["query", "HKLM\\SOFTWARE\\Microsoft\\Cryptography", "/v", "MachineGuid"],
      { encoding: "utf8", windowsHide: true }
    );
    const match = output.match(/MachineGuid\s+REG_SZ\s+([^\r\n]+)/i);
    return match?.[1]?.trim() || "";
  } catch (_error) {
    return "";
  }
};

const getCurrentMachineFingerprint = (): { fingerprintHash: string; description: string } => {
  const hostname = os.hostname() || process.env.COMPUTERNAME || "poste-inconnu";
  const machineGuid = getWindowsMachineGuid();
  const fallbackCpu = os.cpus()?.[0]?.model || process.env.PROCESSOR_IDENTIFIER || "";
  const rawFingerprint = machineGuid
    ? `win32:${machineGuid}`
    : [
        hostname,
        os.platform(),
        os.arch(),
        fallbackCpu,
        String(os.cpus()?.length || ""),
      ].join("|");

  return {
    fingerprintHash: crypto
      .createHmac("sha256", SQLITE_REFERENCE_PASSWORD)
      .update(rawFingerprint)
      .digest("hex"),
    description: `${hostname} (${os.platform()} ${os.arch()})`,
  };
};

const buildCurrentMachineBinding = (): DesktopMachineBinding => {
  const currentMachine = getCurrentMachineFingerprint();

  return {
    fingerprintHash: currentMachine.fingerprintHash,
    description: currentMachine.description,
    boundAt: new Date().toISOString(),
  };
};

const normalizeMachineBinding = (value: any): DesktopMachineBinding | null => {
  if (!value?.fingerprintHash) {
    return null;
  }

  return {
    fingerprintHash: String(value.fingerprintHash),
    description: String(value.description || "Poste inconnu"),
    boundAt: String(value.boundAt || new Date().toISOString()),
  };
};

const getMachineBindingStatus = (config: DesktopLicenseConfig): DesktopMachineBindingStatus => {
  const currentMachine = getCurrentMachineFingerprint();

  return {
    isCurrentMachine: config.machineBinding.fingerprintHash === currentMachine.fingerprintHash,
    description: config.machineBinding.description,
    currentDescription: currentMachine.description,
    boundAt: config.machineBinding.boundAt || null,
  };
};

// Normalise un nom utilisateur pour les comparaisons de securite.
const normalizeUsername = (value?: string): string =>
  // On vide les espaces et on passe en minuscule pour comparer toujours le meme format.
  (value || "").trim().toLowerCase();

// Normalise un code saisi par un client avant comparaison.
const normalizeUnlockCode = (value?: string): string =>
  (value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

// Hash irreversible d'un code de deblocage local.
const hashUnlockCode = (code: string): string =>
  crypto
    .createHmac("sha256", SQLITE_REFERENCE_PASSWORD)
    .update(normalizeUnlockCode(code))
    .digest("hex");

// Genere un segment lisible sans caracteres ambigus.
const generateUnlockCodeSegment = (length = 4): string => {
  let segment = "";

  for (let index = 0; index < length; index += 1) {
    segment += DESKTOP_UNLOCK_CODE_ALPHABET[crypto.randomInt(DESKTOP_UNLOCK_CODE_ALPHABET.length)];
  }

  return segment;
};

// Genere un code imprimable pour le client.
const generateUnlockCodeValue = (): string =>
  `MC-${generateUnlockCodeSegment()}-${generateUnlockCodeSegment()}-${generateUnlockCodeSegment()}-${generateUnlockCodeSegment()}`;

// Construit le pack complet de codes de deblocage offline.
const buildDesktopUnlockCodePack = (): DesktopUnlockCodePack => {
  const usedHashes = new Set<string>();
  const records: DesktopUnlockCodeRecord[] = [];
  const plainCodes: DesktopUnlockCodePlain[] = [];

  DESKTOP_UNLOCK_CODE_PLANS.forEach((plan) => {
    for (let index = 0; index < plan.quantity; index += 1) {
      let code = generateUnlockCodeValue();
      let codeHash = hashUnlockCode(code);

      while (usedHashes.has(codeHash)) {
        code = generateUnlockCodeValue();
        codeHash = hashUnlockCode(code);
      }

      usedHashes.add(codeHash);

      const createdAt = new Date().toISOString();
      const id = crypto.randomBytes(12).toString("hex");

      records.push({
        id,
        codeHash,
        label: plan.label,
        durationDays: plan.durationDays,
        createdAt,
        usedAt: null,
        usedBy: null,
      });

      plainCodes.push({
        id,
        code,
        label: plan.label,
        durationDays: plan.durationDays,
        createdAt,
      });
    }
  });

  return { records, plainCodes };
};

// Nettoie les codes stockes lors d'une migration depuis une ancienne licence.
const normalizeUnlockCodeRecords = (codes: any): DesktopUnlockCodeRecord[] => {
  if (!Array.isArray(codes)) {
    return [];
  }

  return codes
    .map((code) => ({
      id: String(code?.id || crypto.randomBytes(12).toString("hex")),
      codeHash: String(code?.codeHash || ""),
      label: String(code?.label || "Forfait"),
      durationDays: Number(code?.durationDays || 30),
      createdAt: String(code?.createdAt || new Date().toISOString()),
      usedAt: code?.usedAt ? String(code.usedAt) : null,
      usedBy: code?.usedBy ? String(code.usedBy) : null,
    }))
    .filter((code) => code.codeHash && code.durationDays > 0);
};

// Nettoie les codes en clair en attente d'export unique.
const normalizePendingPlainUnlockCodes = (codes: any): DesktopUnlockCodePlain[] => {
  if (!Array.isArray(codes)) {
    return [];
  }

  return codes
    .map((code) => ({
      id: String(code?.id || ""),
      code: String(code?.code || ""),
      label: String(code?.label || "Forfait"),
      durationDays: Number(code?.durationDays || 30),
      createdAt: String(code?.createdAt || new Date().toISOString()),
    }))
    .filter((code) => code.id && normalizeUnlockCode(code.code) && code.durationDays > 0);
};

// Resume l'etat du stock de codes pour l'administration.
const getUnlockCodeStats = (config: DesktopLicenseConfig): DesktopUnlockCodeStats => {
  const total = config.unlockCodes.length;
  const used = config.unlockCodes.filter((code) => Boolean(code.usedAt)).length;

  return {
    total,
    used,
    available: Math.max(0, total - used),
    pendingExport: config.pendingPlainUnlockCodes.length,
  };
};

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
const buildDefaultDesktopLicense = (seedSuperAdminUsername?: string): DesktopLicenseConfig => {
  const unlockCodePack = buildDesktopUnlockCodePack();
  const now = new Date().toISOString();

  return {
    // La date de creation sert de point de depart historique pour la licence locale.
    createdAt: now,
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
    // Les codes en clair ne sont gardes que jusqu'au premier export reserve au superadmin fixe.
    unlockCodes: unlockCodePack.records,
    pendingPlainUnlockCodes: unlockCodePack.plainCodes,
    lastUnlockCodesGeneratedAt: now,
    lastUnlockCodesExportedAt: null,
    machineBinding: buildCurrentMachineBinding(),
  };
};

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
  const storedUnlockCodes = normalizeUnlockCodeRecords(parsedContent.unlockCodes);
  const hasStoredUnlockCodes = storedUnlockCodes.length > 0;
  const unlockCodePack = hasStoredUnlockCodes
    ? { records: storedUnlockCodes, plainCodes: normalizePendingPlainUnlockCodes(parsedContent.pendingPlainUnlockCodes) }
    : buildDesktopUnlockCodePack();
  const storedMachineBinding = normalizeMachineBinding(parsedContent.machineBinding);

  const config: DesktopLicenseConfig = {
    // On part de la configuration par defaut pour garantir une structure complete.
    ...defaultConfig,
    // Puis on surcharge avec les valeurs effectivement stockees dans le fichier.
    ...parsedContent,
    // Enfin, on normalise toujours la liste des createur de l'applications pour garder des comparaisons fiables.
    superAdminUsers: Array.isArray(parsedContent.superAdminUsers)
      ? parsedContent.superAdminUsers.map((item) => normalizeUsername(item)).filter(Boolean)
      : defaultConfig.superAdminUsers,
    unlockCodes: unlockCodePack.records,
    pendingPlainUnlockCodes: unlockCodePack.plainCodes,
    lastUnlockCodesGeneratedAt: parsedContent.lastUnlockCodesGeneratedAt
      ? String(parsedContent.lastUnlockCodesGeneratedAt)
      : defaultConfig.lastUnlockCodesGeneratedAt,
    lastUnlockCodesExportedAt: parsedContent.lastUnlockCodesExportedAt
      ? String(parsedContent.lastUnlockCodesExportedAt)
      : null,
    machineBinding: storedMachineBinding || buildCurrentMachineBinding(),
  };

  if (!hasStoredUnlockCodes || !storedMachineBinding) {
    await writeDesktopLicenseConfig(config);
  }

  return config;
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
  const machineBindingStatus = getMachineBindingStatus(config);
  const isMachineMismatch = !machineBindingStatus.isCurrentMachine;
  // On combine le blocage manuel et l'expiration pour produire l'etat brut de blocage.
  const rawBlocked = config.manuallyBlocked || isExpired || isMachineMismatch;

  return {
    // Un createur de l'application reste autorise a entrer meme si la licence est techniquement bloquee.
    isBlocked: rawBlocked && !isSuperAdmin,
    isSuperAdmin,
    expiresAt: config.expiresAt,
    manuallyBlocked: config.manuallyBlocked,
    // Si la licence a expire, on renvoie un message explicite prioritaire sur le message manuel.
    blockMessage: isMachineMismatch
      ? "Cette licence desktop est liee a un autre ordinateur. Contacte le developpeur pour rattacher la licence a ce poste."
      : isExpired
        ? "La licence desktop a expire. Seul le createur de l'application peut renouveler l'acces."
        : config.blockMessage,
    // On calcule les jours restants pour l'affichage dans le front.
    daysRemaining: computeDaysRemaining(config.expiresAt),
    unlockCodeStats: getUnlockCodeStats(config),
    machineBinding: machineBindingStatus,
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

// Rattache explicitement une licence au poste courant apres verification superadmin.
export const rebindDesktopLicenseMachine = async (payload: {
  nomUtilisateur: string;
  password: string;
}): Promise<DesktopLicenseStatus> => {
  const config = await readDesktopLicenseConfig(payload.nomUtilisateur);

  if (!isFixedDesktopSuperAdminCredentials(payload.nomUtilisateur, payload.password)) {
    throw new Error("Seul le superadmin fixe peut rattacher la licence a ce poste.");
  }

  await writeDesktopLicenseConfig({
    ...config,
    machineBinding: buildCurrentMachineBinding(),
  });

  return getDesktopLicenseStatus(payload.nomUtilisateur);
};

// Debloque l'application avec un code offline fourni au client.
export const unlockDesktopLicenseWithCode = async (payload: {
  nomUtilisateur: string;
  code: string;
}): Promise<DesktopLicenseStatus> => {
  const normalizedCode = normalizeUnlockCode(payload.code);

  if (!normalizedCode) {
    throw new Error("Le code de deblocage est requis.");
  }

  const config = await readDesktopLicenseConfig(payload.nomUtilisateur);
  const machineBindingStatus = getMachineBindingStatus(config);

  if (!machineBindingStatus.isCurrentMachine) {
    throw new Error("Ce code ne peut pas debloquer cette copie: la licence est liee a un autre ordinateur.");
  }

  const codeHash = hashUnlockCode(normalizedCode);
  const matchingCode = config.unlockCodes.find(
    (unlockCode) => unlockCode.codeHash === codeHash
  );

  if (!matchingCode || matchingCode.usedAt) {
    throw new Error("Code de deblocage invalide ou deja utilise.");
  }

  const now = new Date().toISOString();
  const nextConfig: DesktopLicenseConfig = {
    ...config,
    manuallyBlocked: false,
    expiresAt: buildExtendedExpirationDate(config.expiresAt, matchingCode.durationDays),
    lastUnlockedAt: now,
    lastUnlockedBy: payload.nomUtilisateur || "code-client",
    unlockCodes: config.unlockCodes.map((unlockCode) =>
      unlockCode.id === matchingCode.id
        ? {
            ...unlockCode,
            usedAt: now,
            usedBy: payload.nomUtilisateur || "code-client",
          }
        : unlockCode
    ),
    pendingPlainUnlockCodes: config.pendingPlainUnlockCodes.filter(
      (plainCode) => plainCode.id !== matchingCode.id
    ),
  };

  await writeDesktopLicenseConfig(nextConfig);
  return getDesktopLicenseStatus(payload.nomUtilisateur);
};

// Exporte une seule fois le pack initial genere avec la licence locale.
export const exportPendingDesktopUnlockCodes = async (payload: {
  nomUtilisateur: string;
  password: string;
}): Promise<DesktopUnlockCodeExport> => {
  const config = await readDesktopLicenseConfig(payload.nomUtilisateur);

  if (!isFixedDesktopSuperAdminCredentials(payload.nomUtilisateur, payload.password)) {
    throw new Error("Seul le superadmin fixe peut exporter les codes de deblocage.");
  }

  const pendingCodes = normalizePendingPlainUnlockCodes(config.pendingPlainUnlockCodes);

  if (pendingCodes.length === 0) {
    throw new Error("Le pack initial a deja ete exporte. Genere un nouveau pack si necessaire.");
  }

  const exportedAt = new Date().toISOString();
  const nextConfig: DesktopLicenseConfig = {
    ...config,
    pendingPlainUnlockCodes: [],
    lastUnlockCodesExportedAt: exportedAt,
  };

  await writeDesktopLicenseConfig(nextConfig);

  return {
    codes: pendingCodes,
    stats: getUnlockCodeStats(nextConfig),
    exportedAt,
  };
};

// Genere un nouveau pack et remplace tous les codes non utilises.
export const generateDesktopUnlockCodes = async (payload: {
  nomUtilisateur: string;
  password: string;
}): Promise<DesktopUnlockCodeExport> => {
  const config = await readDesktopLicenseConfig(payload.nomUtilisateur);

  if (!isFixedDesktopSuperAdminCredentials(payload.nomUtilisateur, payload.password)) {
    throw new Error("Seul le superadmin fixe peut generer les codes de deblocage.");
  }

  const now = new Date().toISOString();
  const usedCodes = config.unlockCodes.filter((unlockCode) => Boolean(unlockCode.usedAt));
  const unlockCodePack = buildDesktopUnlockCodePack();
  const nextConfig: DesktopLicenseConfig = {
    ...config,
    unlockCodes: [...usedCodes, ...unlockCodePack.records],
    pendingPlainUnlockCodes: [],
    lastUnlockCodesGeneratedAt: now,
    lastUnlockCodesExportedAt: now,
  };

  await writeDesktopLicenseConfig(nextConfig);

  return {
    codes: unlockCodePack.plainCodes,
    stats: getUnlockCodeStats(nextConfig),
    exportedAt: now,
  };
};

// Restaure une sauvegarde SQLite locale apres verification du superadmin fixe.
export const restoreSqliteBackup = async (payload: {
  nomUtilisateur: string;
  password: string;
  backupFilePath: string;
}) => {
  if (!isFixedDesktopSuperAdminCredentials(payload.nomUtilisateur, payload.password)) {
    throw new Error("Seul le superadmin fixe peut restaurer une sauvegarde SQLite.");
  }

  if (!payload.backupFilePath || !fs.existsSync(payload.backupFilePath)) {
    throw new Error("Veuillez fournir un fichier de sauvegarde .zip valide.");
  }

  return sqliteDB.restoreSqliteBackupArchive(payload.backupFilePath);
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
  rebindDesktopLicenseMachine,
  unlockDesktopLicenseWithCode,
  exportPendingDesktopUnlockCodes,
  generateDesktopUnlockCodes,
  restoreSqliteBackup,
  getServerNetworkInfo,
  isFixedDesktopSuperAdminCredentials,
};
