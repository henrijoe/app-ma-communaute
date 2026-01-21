import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";


const comptabiliteRouter: Router = express.Router();

comptabiliteRouter.post("/inserercomptabilite",validator.ajouterComptabiliteValidator(), controllers.ajouterComptablilite);
comptabiliteRouter.get("/listecomptabilite", controllers.recupComptabilite);
comptabiliteRouter.post("/supprimercomptabilite/:id", controllers.supprimerComptabilite);
comptabiliteRouter.post("/modifiercomptabilite/:id", controllers.modifierComptabilite);


export default comptabiliteRouter;