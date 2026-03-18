
  // Interface IEglise
export interface IUtilisateur {
  logoUtilisateur: string;
  nomTemple: string;
  nomUtilisateur: string;
  prenomUtilisateur:string;
  telephoneUtilisateur: string;
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
