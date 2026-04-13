export interface IAgenda {
  idAgenda?: number;
  titreAgenda: string;
  typeAgenda: string;
  dateAgenda: string | null;
  heureDebutAgenda: string;
  heureFinAgenda: string;
  lieuAgenda: string;
  descriptionAgenda: string;
  couleurAgenda: string;
  statutAgenda: string;
  idUtilisateur: number;
  dateCreation?: string | null;
}
