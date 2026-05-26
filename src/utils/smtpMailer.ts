const net = require('net');
const tls = require('tls');

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
};

type MailPayload = {
  to: string;
  subject: string;
  text: string;
};

const getSmtpConfig = (): SmtpConfig | null => {
  const host = String(process.env.SMTP_HOST || '').trim();
  const user = String(process.env.SMTP_USER || '').trim();
  const password = String(process.env.SMTP_PASSWORD || '').trim();
  const from = String(process.env.SMTP_FROM || user || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  if (!host || !user || !password || !from) {
    return null;
  }

  return { host, port, secure, user, password, from };
};

export const isSmtpConfigured = (): boolean => Boolean(getSmtpConfig());

const waitForResponse = (socket: any): Promise<string> =>
  new Promise((resolve, reject) => {
    let buffer = '';

    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1] || '';

      if (/^\d{3}\s/.test(lastLine)) {
        cleanup();
        resolve(buffer);
      }
    };

    socket.on('data', onData);
    socket.on('error', onError);
  });

const sendCommand = async (socket: any, command: string, expectedCodes: number[]): Promise<string> => {
  socket.write(`${command}\r\n`);
  const response = await waitForResponse(socket);
  const code = Number(response.slice(0, 3));

  if (!expectedCodes.includes(code)) {
    throw new Error(`Erreur SMTP (${code}): ${response.trim()}`);
  }

  return response;
};

const connectSocket = (config: SmtpConfig): Promise<any> =>
  new Promise((resolve, reject) => {
    const socket = config.secure
      ? tls.connect(config.port, config.host, { servername: config.host, rejectUnauthorized: false }, () => resolve(socket))
      : net.connect(config.port, config.host, () => resolve(socket));

    socket.once('error', reject);
  });

const upgradeToTls = (socket: any, config: SmtpConfig): Promise<any> =>
  new Promise((resolve, reject) => {
    const secureSocket = tls.connect({
      socket,
      servername: config.host,
      rejectUnauthorized: false,
    }, () => resolve(secureSocket));

    secureSocket.once('error', reject);
  });

const escapeData = (value: string): string =>
  value
    .replace(/\r?\n/g, '\r\n')
    .split('\r\n')
    .map((line) => (line.startsWith('.') ? `.${line}` : line))
    .join('\r\n');

const buildMessage = (config: SmtpConfig, payload: MailPayload): string => {
  const from = config.from;
  const to = payload.to;
  const subject = payload.subject.replace(/\r?\n/g, ' ');

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    payload.text,
  ].join('\r\n');
};

export const sendSmtpMail = async (payload: MailPayload): Promise<void> => {
  const config = getSmtpConfig();

  if (!config) {
    throw new Error('SMTP_NOT_CONFIGURED');
  }

  let socket = await connectSocket(config);

  try {
    await waitForResponse(socket);
    await sendCommand(socket, 'EHLO localhost', [250]);

    if (!config.secure) {
      await sendCommand(socket, 'STARTTLS', [220]);
      socket = await upgradeToTls(socket, config);
      await sendCommand(socket, 'EHLO localhost', [250]);
    }

    await sendCommand(socket, 'AUTH LOGIN', [334]);
    await sendCommand(socket, Buffer.from(config.user).toString('base64'), [334]);
    await sendCommand(socket, Buffer.from(config.password).toString('base64'), [235]);
    await sendCommand(socket, `MAIL FROM:<${config.from}>`, [250]);
    await sendCommand(socket, `RCPT TO:<${payload.to}>`, [250, 251]);
    await sendCommand(socket, 'DATA', [354]);

    socket.write(`${escapeData(buildMessage(config, payload))}\r\n.\r\n`);
    const dataResponse = await waitForResponse(socket);
    const dataCode = Number(dataResponse.slice(0, 3));

    if (dataCode !== 250) {
      throw new Error(`Erreur SMTP (${dataCode}): ${dataResponse.trim()}`);
    }

    await sendCommand(socket, 'QUIT', [221]);
  } finally {
    socket.end();
  }
};
