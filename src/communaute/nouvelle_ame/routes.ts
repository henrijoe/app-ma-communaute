import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";


const nouvelleAmeRouter: Router = express.Router();

nouvelleAmeRouter.post("/inserernouvelleame", validator.ajouterNouvelleAmeValidator(), controllers.ajouterNouvelleAme);
nouvelleAmeRouter.get("/listenouvelleame", controllers.recupNouvelleAme);
nouvelleAmeRouter.post("/supprimernouvelleame/:id", controllers.supprimerNouvelleAme);
nouvelleAmeRouter.post("/modifiernouvelleame/:id", validator.modifierNouvelleAmeValidator(), controllers.modifierNouvelleAme);


export default nouvelleAmeRouter;