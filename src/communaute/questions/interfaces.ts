
export interface ICellule {
  idCellule: number;
  idUtilisateur: number;
  nomCellule: string;
  lieuCellule: string;
  nombreMembreCellule: string;
}

export interface IQuestions {
  idQuestion: number;
  question: string;
  options: string[];
  correctOption: string;
  niveau: string;
  idEglise: number; 
}


