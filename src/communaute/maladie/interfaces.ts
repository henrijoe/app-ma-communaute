export interface IMaladie {
  idMaladie: number | null;
  idMembre: number | null;
  nomMembreMaladie: string;
  typeMaladie: string;
  dateMaladie: string | null;
  lieuHospitalisation: string;
  observationMaladie: string;
  idUtilisateur: number | null;
}
