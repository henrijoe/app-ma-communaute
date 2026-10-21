// Client SasPay : création d'une page de paiement et vérification des webhooks.
//
// Choix du checkout hébergé plutôt que du "softpay" (push direct) : le client choisit
// lui-même Wave, Orange Money, MTN, Moov ou sa carte sur la page SasPay. Aucun code
// réseau n'est donc écrit en dur — la documentation publique n'en publie qu'un seul
// exemple (mtn_bj), et l'endpoint qui les liste demande déjà une clé.
//
// Documentation : https://docs.saspay.me/

import crypto from "crypto";

const BASE_URL = (process.env.SASPAY_BASE_URL || "https://api.saspay.me/api/v1").replace(/\/$/, "");
const CLE_API = process.env.SASPAY_API_KEY || "";
const SECRET_WEBHOOK = process.env.SASPAY_WEBHOOK_SECRET || "";
// SasPay tolère 5 minutes d'écart sur l'horodatage des webhooks.
const TOLERANCE_HORODATAGE_SECONDES = 300;

export type SessionCheckout = {
  id: string;
  checkoutUrl: string;
  statut: string;
  montant: string;
  devise: string;
};

export type EvenementWebhook = {
  event: string;
  data: Record<string, any>;
};

/** L'intégration n'est utilisable qu'une fois la clé secrète renseignée. */
export const estConfigure = (): boolean => Boolean(CLE_API);

export const estEnModeTest = (): boolean => CLE_API.startsWith("sk_test_");

/**
 * Les réponses réelles sont enveloppées : { success, data, code } en cas de succès,
 * { success:false, error, code } en cas d'erreur — contrairement aux exemples de la
 * documentation, qui montrent l'objet nu. On déballe ici une fois pour toutes.
 */
const contenu = (corps: any): any => (corps && corps.data !== undefined ? corps.data : corps);

/**
 * Met en forme le détail d'une erreur. SasPay renvoie une correspondance
 * champ -> messages, par exemple { "amount": ["Le montant minimum est de 200 XOF."] }.
 */
const messageErreur = (corps: any, statutHttp: number): string => {
  const erreur = corps?.error;

  if (typeof erreur === "string") {
    return erreur;
  }

  if (erreur && typeof erreur === "object") {
    const messages = Object.entries(erreur)
      .map(([champ, valeur]) => {
        const texte = Array.isArray(valeur) ? valeur.join(" ") : String(valeur);
        return champ === "detail" ? texte : `${champ} : ${texte}`;
      })
      .join(" ; ");

    if (messages) {
      return messages;
    }
  }

  return corps?.detail || corps?.message || `HTTP ${statutHttp}`;
};

const exigerConfiguration = () => {
  if (!estConfigure()) {
    throw new Error(
      "Le paiement en ligne n'est pas configuré sur ce serveur. Renseignez SASPAY_API_KEY."
    );
  }
};

/**
 * Crée une page de paiement hébergée et retourne son URL.
 * `reference` voyage dans les metadata et nous revient par le webhook : c'est elle
 * qui relie le paiement à l'abonnement de l'église.
 */
export const creerSessionCheckout = async (params: {
  montant: number;
  devise?: string;
  description: string;
  reference: string;
  emailClient: string;
  nomClient: string;
  telephoneClient?: string;
  urlRetour?: string;
  pays?: string;
}): Promise<SessionCheckout> => {
  exigerConfiguration();

  const reponse = await fetch(`${BASE_URL}/checkout-sessions/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLE_API}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // L'API attend un montant décimal sous forme de chaîne.
      amount: params.montant.toFixed(2),
      currency: params.devise || "XOF",
      country: params.pays || "CI",
      description: params.description,
      customer_email: params.emailClient,
      customer_name: params.nomClient,
      ...(params.telephoneClient ? { customer_phone: params.telephoneClient } : {}),
      ...(params.urlRetour ? { return_url: params.urlRetour } : {}),
      metadata: { reference: params.reference },
    }),
  });

  const corps: any = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    throw new Error(`Création du paiement refusée par SasPay : ${messageErreur(corps, reponse.status)}`);
  }

  const session = contenu(corps);

  return {
    id: String(session?.id || ""),
    checkoutUrl: String(session?.checkout_url || ""),
    statut: String(session?.status || "PENDING"),
    montant: String(session?.amount || ""),
    devise: String(session?.currency || "XOF"),
  };
};

export type StatutCheckout = {
  statutSession: string;
  statutTransaction: string;
  transactionId: string;
};

/**
 * Statut d'une session de paiement.
 *
 * C'est le recours officiel quand aucun webhook n'est configuré — le cas d'un poste
 * local, que SasPay ne peut pas joindre. L'identifiant attendu est celui de la
 * session (son `id`), pas son slug.
 */
export const statutCheckout = async (idSession: string): Promise<StatutCheckout> => {
  exigerConfiguration();

  const reponse = await fetch(
    `${BASE_URL}/checkout-sessions/${encodeURIComponent(idSession)}/status/`,
    { headers: { Authorization: `Bearer ${CLE_API}` } }
  );

  const corps: any = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    throw new Error(`Statut de paiement indisponible : ${messageErreur(corps, reponse.status)}`);
  }

  const etat = contenu(corps);

  return {
    statutSession: String(etat?.status || ""),
    statutTransaction: String(etat?.transaction_status || ""),
    // Selon le moment, l'identifiant de transaction arrive à plat ou dans l'objet
    // "transaction", nul tant que personne n'a payé.
    transactionId: String(etat?.transaction_id || etat?.transaction?.id || ""),
  };
};

/** Consultation du statut d'une transaction, utile en secours si un webhook se perd. */
export const verifierTransaction = async (identifiant: string): Promise<any> => {
  exigerConfiguration();

  const reponse = await fetch(`${BASE_URL}/transactions/${encodeURIComponent(identifiant)}/`, {
    headers: { Authorization: `Bearer ${CLE_API}` },
  });

  if (!reponse.ok) {
    throw new Error(`Statut indisponible pour la transaction ${identifiant}.`);
  }

  return reponse.json();
};

/**
 * Vérifie l'authenticité d'un webhook.
 *
 * Signature attendue : HMAC-SHA256(timestamp + "." + corps brut, secret), en
 * minuscules. D'où l'obligation de disposer du corps *brut* : une fois passé par
 * express.json() il est reconstruit, et la signature ne correspond plus.
 */
export const signatureWebhookValide = (params: {
  corpsBrut: string;
  signature?: string;
  horodatage?: string;
}): { valide: boolean; motif?: string } => {
  if (!SECRET_WEBHOOK) {
    return { valide: false, motif: "SASPAY_WEBHOOK_SECRET absent du serveur" };
  }

  if (!params.signature || !params.horodatage) {
    return { valide: false, motif: "signature ou horodatage manquant" };
  }

  const horodatage = Number(params.horodatage);

  if (!Number.isFinite(horodatage)) {
    return { valide: false, motif: "horodatage illisible" };
  }

  const ecart = Math.abs(Math.floor(Date.now() / 1000) - horodatage);

  if (ecart > TOLERANCE_HORODATAGE_SECONDES) {
    // Fenêtre étroite : sans elle, un appel intercepté pourrait être rejoué plus tard.
    return { valide: false, motif: `horodatage hors tolérance (${ecart}s)` };
  }

  const attendue = crypto
    .createHmac("sha256", SECRET_WEBHOOK)
    .update(`${params.horodatage}.${params.corpsBrut}`)
    .digest("hex");

  const recue = Buffer.from(String(params.signature).toLowerCase(), "utf8");
  const calculee = Buffer.from(attendue, "utf8");

  // Comparaison à temps constant : une comparaison directe laisse fuiter la signature
  // attendue, caractère par caractère, par le temps de réponse.
  if (recue.length !== calculee.length || !crypto.timingSafeEqual(recue, calculee)) {
    return { valide: false, motif: "signature invalide" };
  }

  return { valide: true };
};

export default {
  estConfigure,
  estEnModeTest,
  creerSessionCheckout,
  statutCheckout,
  verifierTransaction,
  signatureWebhookValide,
};
