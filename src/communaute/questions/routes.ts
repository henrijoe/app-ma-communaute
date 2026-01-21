import express, { Router } from "express";
import controllers from "./controllers";
import validator from "./validator";


const questionRouter: Router = express.Router();

questionRouter.post("/insererquestion", /* validator.ajouterCelluleValidator(), */ controllers.ajouterQuestion);
questionRouter.get("/listeQuestion", controllers.recupQuestion);
questionRouter.post("/supprimercellule/:id", controllers.supprimerQuestion);
questionRouter.post("/modifiercellule/:id", validator.ajouterCelluleValidator(), controllers.modifierQuestion);

export default questionRouter;