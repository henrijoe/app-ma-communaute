import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

// Copies de l'état de licence rangées hors du dossier de données : dans le registre
// de l'utilisateur et dans ProgramData. Effacer le fichier de licence, ou remettre une
// ancienne copie, ne redonne donc ni un essai neuf ni des jours déjà consommés.
//
// Ce n'est pas une protection absolue : le code est public, et une personne qui efface
// aussi ces copies repart de zéro. Le but est d'arrêter le contournement facile.

const CLE_REGISTRE = "HKCU\\Software\\MaCommunaute\\Licence";

export type EtatAncre = {
  revision: number;
  createdAt: string;
  expiresAt: string;
  manuallyBlocked: boolean;
  lastUnlockedAt: string | null;
  lastUnlockedBy: string | null;
  lastSeenAt: string | null;
  usedSignedCodeIds: string[];
  usedUnlockCodeIds: string[];
};

// Une copie par dossier de données : une démo ou un essai ne touche pas la vraie licence.
const nomAncre = (dossier: string): string =>
  crypto.createHash("sha256").update(path.resolve(dossier).toLowerCase()).digest("hex").slice(0, 24);

const fichierAncre = (dossier: string): string =>
  path.join(process.env.ProgramData || os.homedir(), "MaCommunaute", `${nomAncre(dossier)}.dat`);

const lireRegistre = (dossier: string): string => {
  if (process.platform !== "win32") {
    return "";
  }

  try {
    const sortie = execFileSync("reg", ["query", CLE_REGISTRE, "/v", nomAncre(dossier)], {
      encoding: "utf8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
    });

    return sortie.match(/REG_SZ\s+(\S+)/i)?.[1] || "";
  } catch (_erreur) {
    return "";
  }
};

const lireFichier = (dossier: string): string => {
  try {
    return fs.readFileSync(fichierAncre(dossier), "utf8").trim();
  } catch (_erreur) {
    return "";
  }
};

/** Retourne la copie la plus récente, ou null si aucune n'est lisible. */
export const lireAncre = (
  dossier: string,
  dechiffrer: (contenu: string) => unknown
): EtatAncre | null => {
  const copies = [lireRegistre(dossier), lireFichier(dossier)].flatMap((brut) => {
    if (!brut) {
      return [];
    }

    try {
      return [dechiffrer(Buffer.from(brut, "base64").toString("utf8")) as EtatAncre];
    } catch (_erreur) {
      return [];
    }
  });

  return copies.reduce<EtatAncre | null>(
    (meilleure, copie) =>
      !meilleure || Number(copie.revision || 0) > Number(meilleure.revision || 0) ? copie : meilleure,
    null
  );
};

/**
 * Écrit les deux copies. Un échec reste silencieux : selon le compte Windows, ProgramData
 * peut être en lecture seule, et l'autre copie suffit. Il ne doit pas empêcher l'activation.
 */
export const ecrireAncre = (dossier: string, chiffre: string): void => {
  const contenu = Buffer.from(chiffre, "utf8").toString("base64");

  if (process.platform === "win32") {
    try {
      execFileSync("reg", ["add", CLE_REGISTRE, "/v", nomAncre(dossier), "/t", "REG_SZ", "/d", contenu, "/f"], {
        windowsHide: true,
        stdio: "ignore",
      });
    } catch (_erreur) {
      // L'autre copie prend le relais.
    }
  }

  try {
    fs.mkdirSync(path.dirname(fichierAncre(dossier)), { recursive: true });
    fs.writeFileSync(fichierAncre(dossier), contenu, "utf8");
  } catch (_erreur) {
    // L'autre copie prend le relais.
  }
};
