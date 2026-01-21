import express, { Router } from "express";
import membreRouter from "./membre/routes";
import niveauRouter from "./niveau_etude/routes";
import controllers from "./controllers";
import celluleRouter from "./cellule/routes";
import egliseRouter from "./eglise/routes";
import comptabiliteRouter from "./comptabilite/routes";
import departementRouter from "./departement/routes";
import domaineActiviteRouter from "./domaine_activite/routes";
import nouvelleAmeRouter from "./nouvelle_ame/routes";
import utilisateurRouter from "./utlisateur/routes";
import responsabiliteRouter from "./responsabilite/routes";
import questionRouter from "./questions/routes";
import groupeRouter from "./groupe/routes";
import responsabiliteCelluleRouter from "./responsabilite_cellule/routes";
import culteRouter from "./culte/routes";
import mariageRouter from "./mariage/routes";
import naissanceRouter from "./naissance/routes";
import decesRouter from "./deces/routes";


const communauteRouter: Router = express.Router();
const getDataEgliseRouter: Router = express.Router();
getDataEgliseRouter.get("/getDataEglise/:idUtilisateur", controllers.getDataEglise);

communauteRouter.use(membreRouter);
communauteRouter.use(niveauRouter);
communauteRouter.use(getDataEgliseRouter);
communauteRouter.use(celluleRouter);
communauteRouter.use(groupeRouter);
communauteRouter.use(questionRouter);
communauteRouter.use(egliseRouter);
communauteRouter.use(comptabiliteRouter);
communauteRouter.use(departementRouter);
communauteRouter.use(domaineActiviteRouter);
communauteRouter.use(nouvelleAmeRouter);
communauteRouter.use(utilisateurRouter);
communauteRouter.use(responsabiliteRouter);
communauteRouter.use(responsabiliteCelluleRouter);
communauteRouter.use(culteRouter);
communauteRouter.use(mariageRouter);
communauteRouter.use(naissanceRouter);
communauteRouter.use(decesRouter);

export default communauteRouter;