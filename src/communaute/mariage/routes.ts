import express, { Router } from "express";
import controllers from "./controllers";


const mariageRouter: Router = express.Router();

mariageRouter.post("/inserermariage",/* validator.ajouterMariageValidator(), */ controllers.ajouterMariage);
mariageRouter.get("/listemariage", controllers.recupMariage);
mariageRouter.post("/supprimermariage", controllers.supprimerMariage);
mariageRouter.post("/modifiermariage", /* validator.ajouterMariageValidator(), */ controllers.modifierMariage);
mariageRouter.get("/recupmariagebyutilisateur/:idUtilisateur", controllers.recupMariageByIdUtilsateur);


export default mariageRouter;