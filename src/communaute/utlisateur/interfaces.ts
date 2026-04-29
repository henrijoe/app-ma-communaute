// Interface utilisateur enrichie avec les informations de l'eglise imprimees dans les documents
export interface IUtilisateur {
  logoUtilisateur: string;
  logoEglise: string;
  nomTemple: string;
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
