import express, { Router } from 'express';

import controllers from './controllers';

const tunnelRouter: Router = express.Router();

tunnelRouter.get('/tunnel/status', controllers.getTunnelStatus);
tunnelRouter.post('/tunnel/start', controllers.startTunnel);
tunnelRouter.post('/tunnel/stop', controllers.stopTunnel);

export default tunnelRouter;
