import express, { Router } from "express";
import controllers from "./controllers";


const celluleRouter: Router = express.Router();

celluleRouter.post("/inserercellule",/* validator.ajouterCelluleValidator(), */ controllers.ajouterCellule);
celluleRouter.get("/listecellule", controllers.recupCellule);
celluleRouter.post("/supprimercellule", controllers.supprimerCellule);
celluleRouter.post("/modifiercellule", /* validator.ajouterCelluleValidator(), */ controllers.modifierCellule);
celluleRouter.get("/recupcellulebyutilisateur/:idUtilisateur", controllers.recupCelluleByIdUtilsateur);


export default celluleRouter;