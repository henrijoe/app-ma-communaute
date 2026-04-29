export interface IComptabilite {
  idComptabilite: number;
  idUtilisateur: number;
  nomComptabilite: string;
  entreeComptabilite: string | number;
  sortieComptabilite: string | number;
  dateComptabilite: string;
  observationComptabilite: string;
  estSupprimeComptabilite?: number;
  dateSuppressionComptabilite?: string | null;
  motifSuppressionComptabilite?: string | null;
  supprimeParUtilisateur?: number | null;
  nomUtilisateurSuppression?: string;
}
