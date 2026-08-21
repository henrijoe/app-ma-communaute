export interface IUtilisateur {
  logoUtilisateur: string;
  logoEglise: string;
  nomTemple: string;
  nomEgliseCourt: string;
  lieuEglise: string;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  telephoneSecretariatEglise: string;
  pasteurPrincipal: string;
  pasteurSecondaire: string;
  pasteurTroisieme: string;
  telephonePasteurPrincipal: string;
  telephonePasteurSecondaire: string;
  telephonePasteurTroisieme: string;
  capaciteAccueilEglise: string;
  nombreCultesDimanche: string;
  emailEglise: string;
  boitePostaleEglise: string;
  dateCreationEglise: string;
  nombrePasteursEglise: string;
  nombreAnciensEglise: string;
  nombreDiacresEglise: string;
  modeVersetDashboard: string;
  versetDashboardReference: string;
  versetDashboardTexte: string;
  roleUtilisateur: 'admin' | 'gestionnaire' | 'lecteur';
  permissionsUtilisateur: string;
  idUtilisateurParent: number | null;
  actifUtilisateur: number;
  // 1 = les inscriptions envoyees par QR code doivent etre validees par un responsable
  // avant de devenir des membres ; 0 = elles sont ajoutees directement a la liste.
  validerInscriptionMembre: number;
  password: string;
  confirmPassword: string;
  email: string;
  idUtilisateur: number;
}

export interface ICreateCommunauteDatabasePayload {
  idUtilisateur: number;
  nomTemple: string;
  nomEglise: string;
  dossierBase?: string;
}
