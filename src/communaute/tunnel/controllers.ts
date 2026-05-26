import { Request, Response } from 'express';

import * as tunnel from '../../tunnel';

const DEFAULT_PORT = 49300;

const getServerPort = () => {
  const port = Number(process.env.PORT || DEFAULT_PORT);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
};

const respondError = (res: Response, error: any) => {
  const message = error?.code === 'MODULE_NOT_FOUND'
    ? "Le module localtunnel n'est pas installe. Lance npm install dans le dossier server."
    : error?.message || "Impossible de gerer le tunnel pour le moment.";

  res.status(500).json({
    status: 0,
    message,
  });
};

const getTunnelStatus = (_req: Request, res: Response) => {
  res.json({
    status: 1,
    data: tunnel.getTunnelStatus(),
  });
};

const startTunnel = async (req: Request, res: Response) => {
  try {
    const status = await tunnel.openTunnel({
      contactEglise: req.body?.contactEglise,
      nomTemple: req.body?.nomTemple,
      port: getServerPort(),
      ttlMinutes: req.body?.ttlMinutes,
    });

    res.json({
      status: 1,
      data: status,
      message: 'Tunnel actif',
    });
  } catch (error) {
    respondError(res, error);
  }
};

const stopTunnel = (_req: Request, res: Response) => {
  try {
    tunnel.closeTunnel();
    res.json({
      status: 1,
      data: tunnel.getTunnelStatus(),
      message: 'Tunnel arrete',
    });
  } catch (error) {
    respondError(res, error);
  }
};

export default {
  getTunnelStatus,
  startTunnel,
  stopTunnel,
};
