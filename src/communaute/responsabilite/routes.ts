import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";


const responsabiliteRouter: Router = express.Router();

responsabiliteRouter.post("/insererresponsabilite",validator.ajouterResponsabiliteValidator(), controllers.ajouterResponsabilite);
responsabiliteRouter.get("/listeresponsabilite", controllers.recupResponsabilite);
responsabiliteRouter.post("/supprimerresponsabilite", controllers.supprimerResponsabilite);
responsabiliteRouter.post("/modifierresponsabilite",validator.ajouterResponsabiliteValidator(), controllers.modifierResponsabilite);


export default responsabiliteRouter;