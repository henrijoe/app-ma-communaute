// Accès base pour les abonnements. Une ligne par église (idUtilisateur).

import { _executeSql, _selectSql } from "../../db";

export type Abonnement = {
  idAbonnement: number;
  idUtilisateur: number;
  plan: string;
  statut: string;
  dateDebut: string | null;
  dateFin: string | null;
  montant: number;
  devise: string;
  reference: string | null;
  sessionId: string | null;
  transactionId: string | null;
  moyenPaiement: string | null;
  checkoutUrl: string | null;
};

export const recupererParUtilisateur = async (idUtilisateur: number): Promise<Abonnement | null> => {
  const lignes: any = await _selectSql(
    "SELECT * FROM abonnement WHERE idUtilisateur = ? ORDER BY idAbonnement DESC LIMIT 1",
    [idUtilisateur]
  );

  return Array.isArray(lignes) && lignes.length ? (lignes[0] as Abonnement) : null;
};

export const recupererParReference = async (reference: string): Promise<Abonnement | null> => {
  const lignes: any = await _selectSql("SELECT * FROM abonnement WHERE reference = ? LIMIT 1", [
    reference,
  ]);

  return Array.isArray(lignes) && lignes.length ? (lignes[0] as Abonnement) : null;
};

/** Vrai si ce paiement a déjà été comptabilisé : le webhook est réémis jusqu'à 5 fois. */
export const transactionDejaTraitee = async (transactionId: string): Promise<boolean> => {
  if (!transactionId) {
    return false;
  }

  const lignes: any = await _selectSql(
    "SELECT idAbonnement FROM abonnement WHERE transactionId = ? LIMIT 1",
    [transactionId]
  );

  return Array.isArray(lignes) && lignes.length > 0;
};

export const creer = async (donnees: {
  idUtilisateur: number;
  plan: string;
  montant: number;
  devise: string;
  reference: string;
  sessionId: string;
  checkoutUrl: string;
}): Promise<void> => {
  await _executeSql(
    `INSERT INTO abonnement (idUtilisateur, plan, statut, montant, devise, reference, sessionId, checkoutUrl, dateModification)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      donnees.idUtilisateur,
      donnees.plan,
      "en_attente",
      donnees.montant,
      donnees.devise,
      donnees.reference,
      donnees.sessionId,
      donnees.checkoutUrl,
      new Date().toISOString(),
    ]
  );
};

export const activer = async (donnees: {
  idAbonnement: number;
  dateDebut: string;
  dateFin: string;
  transactionId: string;
  moyenPaiement: string;
}): Promise<void> => {
  await _executeSql(
    `UPDATE abonnement
        SET statut = 'actif', dateDebut = ?, dateFin = ?, transactionId = ?,
            moyenPaiement = ?, dateModification = ?
      WHERE idAbonnement = ?`,
    [
      donnees.dateDebut,
      donnees.dateFin,
      donnees.transactionId,
      donnees.moyenPaiement,
      new Date().toISOString(),
      donnees.idAbonnement,
    ]
  );
};

export const marquerStatut = async (idAbonnement: number, statut: string): Promise<void> => {
  await _executeSql(
    "UPDATE abonnement SET statut = ?, dateModification = ? WHERE idAbonnement = ?",
    [statut, new Date().toISOString(), idAbonnement]
  );
};

export default {
  recupererParUtilisateur,
  recupererParReference,
  transactionDejaTraitee,
  creer,
  activer,
  marquerStatut,
};
