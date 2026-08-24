// Un programme eglise = qui fait quoi a un culte donne (direction, sainte cene,
// predication, offrandes, annonces), plus une thematique/observation libre.
// dateProgramme identifie le culte concerne (format 'YYYY-MM-DD') ; idUtilisateur
// rattache la ligne a une eglise, chaque eglise ayant son propre calendrier.
export interface IProgrammeEglise {
  idProgramme: number;
  idUtilisateur: number;
  dateProgramme: string;
  direction: string;
  saintCene: string;
  predication: string;
  offrandes: string;
  annonces: string;
  thematique: string;
  dateCreation?: string;
}
