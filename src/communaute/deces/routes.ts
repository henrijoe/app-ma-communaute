import express, { Router } from "express";
import controllers from "./controllers";


const decesRouter: Router = express.Router();

decesRouter.post("/insererdeces",/* validator.ajouterDecesValidator(), */ controllers.ajouterDeces);
decesRouter.get("/listedeces", controllers.recupDeces);
decesRouter.post("/supprimerdeces", controllers.supprimerDeces);
decesRouter.post("/modifierdeces", /* validator.ajouterDecesValidator(), */ controllers.modifierDeces);
decesRouter.get("/recupdecesbyutilisateur/:idUtilisateur", controllers.recupDecesByIdUtilsateur);

export default decesRouter;