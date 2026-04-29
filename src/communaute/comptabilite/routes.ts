import express, { Router } from 'express';
import controllers from './controllers';
import validator from './validator';

const comptabiliteRouter: Router = express.Router();

comptabiliteRouter.post('/inserercomptabilite', validator.ajouterComptabiliteValidator(), controllers.ajouterComptablilite);
comptabiliteRouter.get('/listecomptabilite', controllers.recupComptabilite);
comptabiliteRouter.get('/listecomptabilite/:idUtilisateur', controllers.recupComptabilite);
comptabiliteRouter.get('/listecomptabilitesupprimee/:idUtilisateur', controllers.recupComptabiliteSupprimee);
comptabiliteRouter.post('/supprimercomptabilite/:id', controllers.supprimerComptabilite);
comptabiliteRouter.post('/restaurercomptabilite/:id', controllers.restaurerComptabilite);
comptabiliteRouter.post('/supprimercomptabilitedefinitivement/:id', controllers.supprimerComptabiliteDefinitivement);
comptabiliteRouter.post('/modifiercomptabilite/:id', controllers.modifierComptabilite);

export default comptabiliteRouter;
