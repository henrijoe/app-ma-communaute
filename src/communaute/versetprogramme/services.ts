import functions from './functions';
import { IVersetProgramme } from './interfaces';

// Couche intermédiaire entre les controllers et les fonctions SQL. Ici elle
// se contente de relayer l'appel : elle existe pour rester cohérente avec
// le découpage utilise partout ailleurs dans le projet (controller -> service -> functions).
const ajouterVersetProgramme = (data: Partial<IVersetProgramme>) => functions.ajouterVersetProgramme(data);

const modifierVersetProgramme = (data: Partial<IVersetProgramme>) => functions.modifierVersetProgramme(data);

const supprimerVersetProgramme = (idVersetProgramme: number, idUtilisateur: number) =>
  functions.supprimerVersetProgramme(idVersetProgramme, idUtilisateur);

const recupVersetsProgrammeByUtilisateur = (idUtilisateur: number) =>
  functions.recupVersetsProgrammeByUtilisateur(idUtilisateur);

export default {
  ajouterVersetProgramme,
  modifierVersetProgramme,
  supprimerVersetProgramme,
  recupVersetsProgrammeByUtilisateur,
};
