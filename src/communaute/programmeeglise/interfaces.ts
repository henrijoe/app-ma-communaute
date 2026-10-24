// Un programme église = qui fait quoi à un culte donne (direction, sainte cene,
// prédication, offrandes, annonces), plus une thematique/observation libre.
// dateProgramme identifie le culte concerne (format 'YYYY-MM-DD') ; idUtilisateur
// rattache la ligne à une église, chaque église ayant son propre calendrier.
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
