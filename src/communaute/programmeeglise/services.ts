import functions from './functions';
import { IProgrammeEglise } from './interfaces';

// Couche intermédiaire entre les controllers et les fonctions SQL. Ici elle
// se contente de relayer l'appel : elle existe pour rester cohérente avec
// le découpage utilise partout ailleurs dans le projet (controller -> service -> functions).
const ajouterProgrammeEglise = (data: Partial<IProgrammeEglise>) => functions.ajouterProgrammeEglise(data);

const modifierProgrammeEglise = (data: Partial<IProgrammeEglise>) => functions.modifierProgrammeEglise(data);

const supprimerProgrammeEglise = (idProgramme: number, idUtilisateur: number) =>
  functions.supprimerProgrammeEglise(idProgramme, idUtilisateur);

const recupProgrammesEgliseByUtilisateur = (idUtilisateur: number) =>
  functions.recupProgrammesEgliseByUtilisateur(idUtilisateur);

export default {
  ajouterProgrammeEglise,
  modifierProgrammeEglise,
  supprimerProgrammeEglise,
  recupProgrammesEgliseByUtilisateur,
};
