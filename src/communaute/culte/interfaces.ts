
export interface ICulte {
  idCulte: number | null;
  idUtilisateur: number | null;
  typeCulte: string;
  dateCulte: string;
  dirigeant: string;
  predication: string;
  passageBiblique: string;
  themePredication: string;
  nombreHommeCulte: string;
  nombreFemmeCulte: string;
  offrandeCulte: string;
  /** Dîme relevée au culte, à côté de l'offrande. */
  dimeCulte: string;
  ecodim: string;
  filleEcodim: string;
  /**
   * Ancienne offrande de l'école du dimanche.
   *
   * Elle n'est plus saisie ni écrite : la caisse de l'Ecodim est désormais
   * tenue à part (table `ecodim_finance`). Le champ reste déclaré parce que
   * les relevés passés le portent encore et continuent d'être lus.
   */
  offrandeEcodim?: string;
  resumePredication: string;
}


