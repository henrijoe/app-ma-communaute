
export interface IGroupe {
  idGroupe: number;
  libelleGroupe: string;
  descriptionGroupe: string;
  responsableGroupe: string;
  idUtilisateur: number;
}

export interface GroupeResponse {
  status: number;
    error?: any;
    data?: any;
}


