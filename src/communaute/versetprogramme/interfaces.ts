// Un verset programme = un verset biblique choisi par l'admin pour
// s'afficher sur le tableau de bord a une date precise (dateAffichage,
// format 'YYYY-MM-DD'). idUtilisateur rattache le verset a une eglise :
// chaque eglise a son propre calendrier, invisible des autres.
export interface IVersetProgramme {
  idVersetProgramme: number;
  idUtilisateur: number;
  dateAffichage: string;
  reference: string;
  texte: string;
  dateCreation?: string;
}
