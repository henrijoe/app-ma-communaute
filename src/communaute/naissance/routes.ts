import express, { Router } from "express";
import controllers from "./controllers";


const naissanceRouter: Router = express.Router();

naissanceRouter.post("/inserernaissance",/* validator.ajouterNaissanceValidator(), */ controllers.ajouterNaissance);
naissanceRouter.get("/listenaissance", controllers.recupNaissance);
naissanceRouter.post("/supprimernaissance", controllers.supprimerNaissance);
naissanceRouter.post("/modifiernaissance", /* validator.ajouterNaissanceValidator(), */ controllers.modifierNaissance);
naissanceRouter.get("/recupnaissancebyutilisateur/:idUtilisateur", controllers.recupNaissanceByIdUtilsateur);


export default naissanceRouter;