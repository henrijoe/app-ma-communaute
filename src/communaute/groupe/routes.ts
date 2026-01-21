import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";


const groupeRouter: Router = express.Router();

groupeRouter.post("/inserergroupe", validator.ajouterGroupeValidator(), controllers.ajouterGroupe);
groupeRouter.get("/listegroupe", controllers.recupGroupe);
groupeRouter.post("/supprimergroupe", controllers.supprimerGroupe);
groupeRouter.post("/modifiergroupe", validator.modifierGroupeValidator(), controllers.modifierGroupe);
groupeRouter.get("/recupgroupebyutilisateur/:idUtilisateur", controllers.recupGroupeByIdUtilsateur);

export default groupeRouter;