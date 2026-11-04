import functions from "./functions";

// Autres cotisations de l'église : Caisse de Noël, solidarité veuves et orphelins...
// Le nom est saisi librement, et chaque ligne dit quel membre a donné combien.
// Les totaux se calculent à l'affichage, pour suivre la recherche et la période.

const MONTANT_MAXIMUM = 1000000000;

const nettoyer = (valeur: unknown): string => String(valeur ?? "").trim();

const preparer = async (data: any) => {
  const idUtilisateur = Number(data.idUtilisateur);
  const idMembre = Number(data.idMembre);
  const montantVersement = Number(data.montantVersement);
  const nomCotisation = nettoyer(data.nomCotisation);
  const dateVersement = nettoyer(data.dateVersement);

  if (!nomCotisation) {
    throw new Error("Indiquez le nom de la cotisation.");
  }

  // Le nom vient de la fiche du membre et reste écrit sur la ligne : l'historique
  // garde qui a donné, même si la fiche disparaît un jour.
  const membre = idMembre ? await functions.recupMembre(idMembre, idUtilisateur) : null;

  if (!membre) {
    throw new Error("Choisissez le membre qui a donné.");
  }

  if (!Number.isInteger(montantVersement) || montantVersement <= 0 || montantVersement > MONTANT_MAXIMUM) {
    throw new Error("Indiquez un montant valide, en francs, sans virgule.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVersement) || Number.isNaN(new Date(dateVersement).getTime())) {
    throw new Error("Indiquez la date du versement.");
  }

  return {
    nomCotisation,
    idMembre,
    nomMembreVersement: `${membre.nomMembre || ""} ${membre.prenomMembre || ""}`.trim(),
    montantVersement,
    dateVersement,
    observationVersement: nettoyer(data.observationVersement),
    idUtilisateur,
  };
};

const recupCotisations = (idUtilisateur: number) => functions.recupCotisations(idUtilisateur);

const ajouterCotisation = async (data: any) => {
  const cotisation = await preparer(data);
  const idCotisation = await functions.ajouterCotisation(cotisation);
  return functions.recupCotisation(idCotisation, cotisation.idUtilisateur);
};

const modifierCotisation = async (data: any) => {
  const cotisation = await preparer(data);
  const idCotisation = Number(data.idCotisation);

  if (!(await functions.recupCotisation(idCotisation, cotisation.idUtilisateur))) {
    throw new Error("Cette cotisation est introuvable.");
  }

  await functions.modifierCotisation(idCotisation, cotisation);
  return functions.recupCotisation(idCotisation, cotisation.idUtilisateur);
};

const supprimerCotisation = async (data: any) => {
  const idCotisation = Number(data.idCotisation);
  await functions.supprimerCotisation(idCotisation, Number(data.idUtilisateur));
  return { idCotisation };
};

export default {
  recupCotisations,
  ajouterCotisation,
  modifierCotisation,
  supprimerCotisation,
};
