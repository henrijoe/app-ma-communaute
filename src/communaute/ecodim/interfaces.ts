// École du dimanche (Ecodim) : classes, moniteurs et enfants.

export interface IClasseEcodim {
  idClasseEcodim?: number;
  libelleClasse: string;
  trancheAge?: string;
  ageMin?: number | null;
  ageMax?: number | null;
  descriptionClasse?: string;
  actifClasse?: number;
  idUtilisateur: number;
}

export interface IMoniteurEcodim {
  idMoniteur?: number;
  /** Le moniteur est un membre de l'église : son identité vient de la table membre. */
  idMembre: number;
  idClasseEcodim?: number | null;
  estPrincipal?: number;
  fonctionMoniteur?: string;
  /** Classes encadrees : [{ idClasseEcodim, estPrincipal }]. */
  classes?: { idClasseEcodim: number; estPrincipal?: number }[];
  dateAffectation?: string | null;
  actifMoniteur?: number;
  idUtilisateur: number;
}

export interface IEnfantEcodim {
  idEnfantEcodim?: number;
  nomEnfant: string;
  prenomEnfant?: string;
  sexeEnfant?: string;
  dateNaissEnfant?: string | null;
  lieuNaissEnfant?: string;
  lieuHabitationEnfant?: string;
  niveauScolaireEnfant?: string;
  activiteEnfant?: string;
  nomParentEnfant?: string;
  contactParentEnfant?: string;
  emailParentEnfant?: string;
  adresseParentEnfant?: string;
  religionParents?: string;

  contactEnfant?: string;
  numeroAppartement?: string;

  nomPere?: string;
  prenomPere?: string;
  lieuHabitationPere?: string;
  professionPere?: string;
  contactPere?: string;
  pereConverti?: string;

  nomMere?: string;
  prenomMere?: string;
  lieuHabitationMere?: string;
  professionMere?: string;
  contactMere?: string;
  mereConverti?: string;

  tuteurConverti?: string;
  vitAvec?: string;

  // Champs de la fiche d'inscription du département enfants.
  groupeEcodimEnfant?: string;
  ecoleEnfant?: string;
  religionPere?: string;
  religionMere?: string;
  avecQuiVientEglise?: string;
  responsabiliteTuteurEglise?: string;
  professionTuteur?: string;

  dateEntreeEcodim?: string | null;
  niveauEntreeEcodim?: string;
  niveauActuelEcodim?: string;
  dateBaptemeEsprit?: string | null;
  lieuBaptemeEsprit?: string;
  dateSortieEcodim?: string | null;
  motifSortieEcodim?: string;
  categorieSortieEcodim?: string;

  situationSociale?: string;
  precisionSituationSociale?: string;

  dateDepart?: string | null;
  motifDepart?: string;

  idClasseEcodim?: number | null;
  actifEnfant?: number;
  idUtilisateur: number;
}

export interface ICulteEcodim {
  idCulteEcodim?: number;
  dateCulte: string;
  idClasseEcodim?: number | null;
  idMoniteurDirigeant?: number | null;
  nomDirigeantExterne?: string;
  sujetsPriere?: string;
  chantsCulte?: string;
  idMoniteurEnseignant?: number | null;
  nomEnseignantExterne?: string;
  leconDuJour?: string;
  passageBiblique?: string;
  resumePredication?: string;
  versetOr?: string;
  montantOffrande?: number | null;
  nombreFilles?: number | null;
  nombreGarcons?: number | null;
  nomSignatureEnseignant?: string;
  nomSignatureResponsable?: string;
  nomSignatureDirection?: string;
  observationsCulte?: string;
  idUtilisateur: number;
}

export interface IEvaluationEcodim {
  idEvaluation?: number;
  libelleEvaluation: string;
  typeEvaluation?: string;
  idClasseEcodim?: number | null;
  /** Classes concernees. Une evaluation en compte au moins une. */
  classes?: (number | string)[];
  dateEvaluation?: string | null;
  coefficient?: number | null;
  noteSur?: number | null;
  anneeEcclesiastique?: string;
  idUtilisateur: number;
}

export interface INoteEcodim {
  idEvaluation: number;
  idEnfantEcodim: number;
  valeurNote?: string | number | null;
}

/** Une ligne d'appel : un enfant, pour une seance donnee. */
export interface IPresenceEcodim {
  idEnfantEcodim: number;
  /** present, absent ou excuse. Sans accent, comme les autres valeurs a choix. */
  statutPresence?: string;
  motifPresence?: string;
}
