import express, { Router } from "express";
import controllers from "./controllers";


const responsabiliteCelluleRouter: Router = express.Router();

responsabiliteCelluleRouter.post("/insererresponsabilitecellule", controllers.ajouterResponsabilite);
responsabiliteCelluleRouter.get("/listeresponsabilitecellule", controllers.recupResponsabilite);
responsabiliteCelluleRouter.post("/supprimerresponsabilitecelluke/:id", controllers.supprimerResponsabilite);
responsabiliteCelluleRouter.post("/modifierresponsabilitecellule/:id", controllers.modifierResponsabilite);


export default responsabiliteCelluleRouter;