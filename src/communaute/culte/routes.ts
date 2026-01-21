import express, { Router } from "express";
import controllers from "./controllers";


const culteRouter: Router = express.Router();

culteRouter.post("/insererculte",/* validator.ajouterCulteValidator(), */ controllers.ajouterCulte);
culteRouter.get("/listeculte", controllers.recupCulte);
culteRouter.post("/supprimerculte", controllers.supprimerCulte);
culteRouter.post("/modifierculte", /* validator.ajouterCulteValidator(), */ controllers.modifierCulte);
culteRouter.get("/recupcultebyutilisateur/:idUtilisateur", controllers.recupCulteByIdUtilsateur);


export default culteRouter;