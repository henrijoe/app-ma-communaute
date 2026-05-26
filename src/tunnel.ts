type TunnelInstance = {
  close: () => void;
  url: string;
};

type TunnelStatus = {
  active: boolean;
  expiresAt: string | null;
  localPort: number | null;
  requestedSubdomain: string;
  startedAt: string | null;
  url: string;
};

let activeTunnel: TunnelInstance | null = null;
let activeStatus: TunnelStatus = {
  active: false,
  expiresAt: null,
  localPort: null,
  requestedSubdomain: '',
  startedAt: null,
  url: '',
};
let autoCloseTimer: NodeJS.Timeout | null = null;

const DEFAULT_TUNNEL_TTL_MINUTES = 120;

const slugify = (value: string): string =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

const buildTunnelSubdomain = (nomTemple?: string, contactEglise?: string): string => {
  const templeSlug = slugify(nomTemple || 'eglise');
  const contactSlug = slugify(contactEglise || 'contact');
  const uniqueSuffix = Math.random().toString(36).slice(2, 7);

  return ['ma-communaute', templeSlug, contactSlug, uniqueSuffix].filter(Boolean).join('-').slice(0, 63);
};

const clearAutoCloseTimer = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
};

const resetStatus = () => {
  activeStatus = {
    active: false,
    expiresAt: null,
    localPort: null,
    requestedSubdomain: '',
    startedAt: null,
    url: '',
  };
};

export const closeTunnel = () => {
  clearAutoCloseTimer();

  if (activeTunnel) {
    activeTunnel.close();
    activeTunnel = null;
  }

  resetStatus();
};

export const getTunnelStatus = (): TunnelStatus => ({ ...activeStatus });

export const openTunnel = async ({
  contactEglise,
  nomTemple,
  port,
  ttlMinutes,
}: {
  contactEglise?: string;
  nomTemple?: string;
  port: number;
  ttlMinutes?: number;
}): Promise<TunnelStatus> => {
  const localtunnel = require('localtunnel');
  const requestedSubdomain = buildTunnelSubdomain(nomTemple, contactEglise);
  const ttl = Math.max(10, Number(ttlMinutes || process.env.TUNNEL_TTL_MINUTES || DEFAULT_TUNNEL_TTL_MINUTES));

  if (activeTunnel) {
    return getTunnelStatus();
  }

  const tunnel = await localtunnel({
    port,
    local_host: process.env.TUNNEL_LOCAL_HOST || '127.0.0.1',
    subdomain: requestedSubdomain,
  });

  activeTunnel = tunnel;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + ttl * 60 * 1000);

  activeStatus = {
    active: true,
    expiresAt: expiresAt.toISOString(),
    localPort: port,
    requestedSubdomain,
    startedAt: startedAt.toISOString(),
    url: tunnel.url,
  };

  tunnel.on('close', () => {
    activeTunnel = null;
    clearAutoCloseTimer();
    resetStatus();
  });

  tunnel.on('error', () => {
    activeTunnel = null;
    clearAutoCloseTimer();
    resetStatus();
  });

  clearAutoCloseTimer();
  autoCloseTimer = setTimeout(() => {
    closeTunnel();
  }, ttl * 60 * 1000);

  return getTunnelStatus();
};
