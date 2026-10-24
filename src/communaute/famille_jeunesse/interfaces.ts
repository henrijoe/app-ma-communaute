export interface IFamilleJeunesse {
  idFamilleJeunesse: number;
  idUtilisateur: number;
  nomFamilleJeunesse: string;
  sloganFamille: string;
  conseillerFamille: string;
  nomAnimateur: string;
  nomViceAnimateur: string;
  nomSecretaire: string;
  nomSecretaireAdjoint: string;
  nomTresorier: string;
  nomTresorierAdjoint: string;
  nomSecretaireOrganisation1: string;
  nomSecretaireOrganisation2: string;
  nomSecretaireOrganisation3: string;
  nomCommissaireAuCompte: string;
  nomCommissaireAuCompteAdjoint: string;
  nombreMembreTotal: number;
  nombreMembreActuel: number;
  remarque: string;
}

export interface FamilleJeunesseResponse {
  status: number;
  error?: any;
  data?: any;
}
