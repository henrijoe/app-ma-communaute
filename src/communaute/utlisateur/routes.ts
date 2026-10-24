import express, { Router } from 'express';
import controllers from './controllers';

const utilisateurRouter: Router = express.Router();

utilisateurRouter.post('/ajouterutilisateur', controllers.ajouterUtilisateur);
utilisateurRouter.post('/creer-base-sqlite', controllers.creerBaseSqlite);
utilisateurRouter.get('/listeutilisateur', controllers.recupUtilisateur);
utilisateurRouter.get('/listeutilisateurparent/:idUtilisateurParent', controllers.recupUtilisateurByParentId);
utilisateurRouter.post('/supprimerutilisateur', controllers.supprimerUtilisateur);
utilisateurRouter.post('/modifierutilisateur', controllers.modifierUtilisateur);
utilisateurRouter.post('/demander-reset-password', controllers.demanderResetPassword);
utilisateurRouter.post('/reinitialiser-password', controllers.reinitialiserPassword);
utilisateurRouter.post('/connexionutilisateur', controllers.connexionUtilisateur);
utilisateurRouter.post('/login', controllers.login);

export default utilisateurRouter;
