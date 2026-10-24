import express, { Router } from 'express';
import controllers from './controllers';

// Routes du module "programme église" : planification de qui dirige, prêche,
// fait les annonces, etc. à chaque culte (Agenda > onglet "Programme église").
const programmeEgliseRouter: Router = express.Router();

programmeEgliseRouter.post('/ajouterprogrammeeglise', controllers.ajouterProgrammeEglise);
programmeEgliseRouter.post('/modifierprogrammeeglise', controllers.modifierProgrammeEglise);
programmeEgliseRouter.post('/supprimerprogrammeeglise', controllers.supprimerProgrammeEglise);
programmeEgliseRouter.get('/programmeseglise/:idUtilisateur', controllers.recupProgrammesEgliseByUtilisateur);

export default programmeEgliseRouter;
