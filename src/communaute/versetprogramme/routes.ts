import express, { Router } from 'express';
import controllers from './controllers';

// Routes du module "verset programme" : gestion du calendrier de versets
// bibliques que l'admin programme a l'avance pour le tableau de bord
// (Parametres > Verset du jour > mode "Programme sur plusieurs mois").
const versetProgrammeRouter: Router = express.Router();

versetProgrammeRouter.post('/ajouterversetprogramme', controllers.ajouterVersetProgramme);
versetProgrammeRouter.post('/modifierversetprogramme', controllers.modifierVersetProgramme);
versetProgrammeRouter.post('/supprimerversetprogramme', controllers.supprimerVersetProgramme);
versetProgrammeRouter.get('/versetsprogramme/:idUtilisateur', controllers.recupVersetsProgrammeByUtilisateur);

export default versetProgrammeRouter;
