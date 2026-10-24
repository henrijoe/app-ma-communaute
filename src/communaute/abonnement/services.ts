// Logique d'abonnement : souscription à la création d'une église, activation par
// webhook, et état consultable par l'application.
//
// Le mobile money ne permet pas de prélèvement automatique : SasPay n'expose donc
// aucune notion d'abonnement récurrent. Chaque renouvellement est un nouveau paiement,
// déclenché depuis l'application. C'est nous qui portons le cycle de vie.

import functions, { Abonnement } from "./functions";
import saspay from "./saspay";

export type Plan = "mensuel" | "annuel";

type DefinitionPlan = {
  libelle: string;
  jours: number;
  montant: number;
};

const PLANS: Record<Plan, DefinitionPlan> = {
  mensuel: {
    libelle: "Abonnement mensuel",
    jours: 30,
    montant: Number(process.env.ABONNEMENT_PRIX_MENSUEL || 5000),
  },
  annuel: {
    libelle: "Abonnement annuel",
    jours: 365,
    montant: Number(process.env.ABONNEMENT_PRIX_ANNUEL || 50000),
  },
};

// Sur un poste local, l'accès est réglé par la licence desktop : l'abonnement ne
// s'applique qu'au service en ligne.
export const abonnementRequis = (): boolean =>
  String(process.env.ABONNEMENT_REQUIS || "false").trim().toLowerCase() === "true";

const planValide = (plan?: string): Plan => (plan === "annuel" ? "annuel" : "mensuel");

const ajouterJours = (depuis: Date, jours: number): Date => {
  const date = new Date(depuis.getTime());
  date.setDate(date.getDate() + jours);
  return date;
};

const joursRestants = (dateFin?: string | null): number => {
  if (!dateFin) {
    return 0;
  }

  const restant = new Date(dateFin).getTime() - Date.now();
  return restant <= 0 ? 0 : Math.ceil(restant / (1000 * 60 * 60 * 24));
};

/**
 * Ouvre une souscription et retourne l'URL de paiement à présenter au client.
 * Appelée juste après la création du compte de l'église.
 */
export const demarrerSouscription = async (donnees: {
  idUtilisateur: number;
  plan?: string;
  emailClient: string;
  nomClient: string;
  telephoneClient?: string;
  urlRetour?: string;
}): Promise<{ checkoutUrl: string; reference: string; montant: number; plan: Plan }> => {
  const plan = planValide(donnees.plan);
  const definition = PLANS[plan];

  if (!donnees.idUtilisateur) {
    throw new Error("Compte introuvable pour cette souscription.");
  }

  // Référence courte, unique et lisible dans le tableau de bord SasPay.
  const reference = `ABN-${donnees.idUtilisateur}-${Date.now().toString(36).toUpperCase()}`;

  const session = await saspay.creerSessionCheckout({
    montant: definition.montant,
    description: `${definition.libelle} - Ma Communauté`,
    reference,
    emailClient: donnees.emailClient,
    nomClient: donnees.nomClient,
    telephoneClient: donnees.telephoneClient,
    urlRetour: donnees.urlRetour || process.env.ABONNEMENT_URL_RETOUR,
  });

  await functions.creer({
    idUtilisateur: donnees.idUtilisateur,
    plan,
    montant: definition.montant,
    devise: session.devise,
    reference,
    sessionId: session.id,
    checkoutUrl: session.checkoutUrl,
  });

  return { checkoutUrl: session.checkoutUrl, reference, montant: definition.montant, plan };
};

/**
 * Crédite une période à partir d'un paiement confirmé.
 *
 * Point de passage unique du webhook et de la vérification au retour : les deux
 * chemins peuvent constater le même paiement, parfois à quelques secondes d'écart.
 * La garde sur transactionId fait qu'un seul des deux crédite réellement.
 */
const activerDepuisPaiement = async (donnees: {
  reference: string;
  transactionId: string;
  moyenPaiement?: string;
}): Promise<{ traite: boolean; motif: string }> => {
  if (await functions.transactionDejaTraitee(donnees.transactionId)) {
    return { traite: false, motif: "paiement déjà comptabilisé" };
  }

  const abonnement = donnees.reference
    ? await functions.recupererParReference(donnees.reference)
    : null;

  if (!abonnement) {
    return { traite: false, motif: `aucune souscription pour la référence ${donnees.reference}` };
  }

  const plan = planValide(abonnement.plan);
  // Un renouvellement anticipé prolonge la période en cours au lieu de la remplacer.
  const depart =
    abonnement.dateFin && new Date(abonnement.dateFin).getTime() > Date.now()
      ? new Date(abonnement.dateFin)
      : new Date();

  await functions.activer({
    idAbonnement: abonnement.idAbonnement,
    dateDebut: new Date().toISOString(),
    dateFin: ajouterJours(depart, PLANS[plan].jours).toISOString(),
    transactionId: donnees.transactionId,
    moyenPaiement: donnees.moyenPaiement || "",
  });

  return { traite: true, motif: "abonnement activé" };
};

/**
 * Traite un événement reçu de SasPay. Idempotent : le même paiement peut arriver
 * jusqu'à cinq fois (politique de réessai), il ne doit créditer qu'une période.
 */
export const traiterEvenement = async (evenement: {
  event: string;
  data: Record<string, any>;
}): Promise<{ traite: boolean; motif: string }> => {
  const { event, data } = evenement;

  if (event !== "transaction.success") {
    // Les autres statuts (échec, annulation) laissent l'abonnement en attente :
    // le client peut relancer un paiement sans qu'on perde la trace de la demande.
    return { traite: false, motif: `événement ignoré (${event})` };
  }

  return activerDepuisPaiement({
    reference: String(data?.metadata?.reference || ""),
    transactionId: String(data?.id || data?.reference || ""),
    moyenPaiement: String(data?.network?.code || data?.network || ""),
  });
};

/**
 * Vérifie auprès de SasPay où en est le paiement d'une souscription, et active
 * l'abonnement s'il est réglé.
 *
 * Deux usages : le test en local, où SasPay ne peut joindre aucun webhook faute
 * d'adresse publique ; et le filet en production, quand une notification se perd
 * (serveur redémarré, coupure réseau). Sans ce recours, un client aurait payé sans
 * être activé.
 */
export const verifierEtActiver = async (
  reference: string
): Promise<{ traite: boolean; motif: string; statut: string }> => {
  const abonnement = await functions.recupererParReference(reference);

  if (!abonnement) {
    return { traite: false, motif: "souscription introuvable", statut: "absent" };
  }

  if (abonnement.statut === "actif" && joursRestants(abonnement.dateFin) > 0) {
    return { traite: false, motif: "abonnement déjà actif", statut: "actif" };
  }

  if (!abonnement.sessionId) {
    return { traite: false, motif: "aucune session de paiement enregistrée", statut: abonnement.statut };
  }

  const statut = await saspay.statutCheckout(abonnement.sessionId);
  const paye = statut.statutTransaction === "SUCCESS" || statut.statutSession === "PAID";

  if (!paye) {
    return {
      traite: false,
      motif: `paiement non confirmé (${statut.statutSession || statut.statutTransaction || "inconnu"})`,
      statut: abonnement.statut,
    };
  }

  const resultat = await activerDepuisPaiement({
    reference,
    transactionId: statut.transactionId,
  });

  return { ...resultat, statut: resultat.traite ? "actif" : abonnement.statut };
};

export type EtatAbonnement = {
  actif: boolean;
  requis: boolean;
  statut: string;
  plan: string;
  dateFin: string | null;
  joursRestants: number;
  message: string;
  checkoutUrl: string | null;
};

/** État présenté à l'application, et utilisé pour ouvrir ou fermer l'accès. */
export const etatAbonnement = async (idUtilisateur: number): Promise<EtatAbonnement> => {
  const requis = abonnementRequis();
  const abonnement: Abonnement | null = await functions.recupererParUtilisateur(idUtilisateur);
  const restants = joursRestants(abonnement?.dateFin);
  const actif = Boolean(abonnement && abonnement.statut === "actif" && restants > 0);

  let message = "";

  if (requis && !abonnement) {
    message = "Aucun abonnement n'est associé à ce compte. Souscrivez pour activer l'accès.";
  } else if (requis && !actif && abonnement?.statut === "en_attente") {
    message = "Votre paiement n'a pas encore été confirmé. Terminez la souscription pour continuer.";
  } else if (requis && !actif) {
    message = "Votre abonnement a expiré. Renouvelez-le pour retrouver l'accès.";
  }

  return {
    actif,
    requis,
    statut: abonnement?.statut || "absent",
    plan: abonnement?.plan || "",
    dateFin: abonnement?.dateFin || null,
    joursRestants: restants,
    message,
    checkoutUrl: abonnement?.checkoutUrl || null,
  };
};

/** Bloque-t-on la connexion de ce compte ? Faux tant que l'abonnement n'est pas exigé. */
export const accesBloque = async (
  idUtilisateur: number
): Promise<{ bloque: boolean; message: string }> => {
  if (!abonnementRequis() || !idUtilisateur) {
    return { bloque: false, message: "" };
  }

  const etat = await etatAbonnement(idUtilisateur);
  return { bloque: !etat.actif, message: etat.message };
};

export default {
  abonnementRequis,
  demarrerSouscription,
  traiterEvenement,
  verifierEtActiver,
  etatAbonnement,
  accesBloque,
  PLANS,
};
