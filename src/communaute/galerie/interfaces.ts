export interface IGalerieEvenement {
  idGalerie?: number;
  titreGalerie: string;
  typeEvenement: string;
  dateEvenement: string | null;
  lieuEvenement: string;
  descriptionGalerie: string;
  couvertureGalerie: string;
  dossierGalerie: string;
  dateCreation?: string | null;
  idUtilisateur: number;
  nombreImages?: number;
}

export interface IGalerieImage {
  idGalerieImage?: number;
  idGalerie: number;
  nomFichier: string;
  cheminImage: string;
  tailleImage?: number | null;
  typeMime: string;
  legendeImage?: string;
  dateAjout?: string | null;
  idUtilisateur: number;
}

export interface IGalerieImagePayload {
  base64: string;
  legendeImage?: string;
  nomOriginal: string;
  typeMime?: string;
}
