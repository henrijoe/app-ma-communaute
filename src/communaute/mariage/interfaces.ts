
export interface IMariage {
  idMariage: number;
  idUtilisateur: number;
  idFrereMembre?: number | null;
  idSoeurMembre?: number | null;
  nomFrereMariage: string;
  nomSoeurMariage: string;
  dateMariage: string|null;
  lieuMariage: string;
  culteMariage: string;
  temoin1Mariage: string;
  temoin2Mariage: string;
  lieuReception: string;
  contactMariage: string;
}
