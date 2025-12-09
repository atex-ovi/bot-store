#!/usr/bin/env node
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from 'atexovi-baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import dotenv from 'dotenv';
import { handler } from './src/handler.js';
import { wrapSendMessageGlobally } from './src/utils/typing.js';

dotenv.config({ debug: false });

const originalError = console.error;
const originalLog = console.log;
const originalStdoutWrite = process.stdout.write;
const FILTER_PATTERNS = [
  'Bad MAC',
  'Failed to decrypt message with any known session',
  'Session error:',
  'Failed to decrypt',
  'Closing open session',
  'Closing session:',
  'SessionEntry',
  '_chains:',
  'registrationId:',
  'currentRatchet:',
  'indexInfo:',
  '<Buffer',
  'pubKey:',
  'privKey:',
  'baseKey:',
  'remoteIdentityKey:',
  'lastRemoteEphemeralKey:',
  'ephemeralKeyPair:',
  'chainKey:',
  'chainType:',
  'messageKeys:',
  'previousCounter:',
  'rootKey:'
];

process.stdout.write = function(chunk, encoding, callback) {
  const str = chunk.toString();
  const shouldFilter = FILTER_PATTERNS.some(pattern => str.includes(pattern));
  
  if (shouldFilter) {
    if (str.includes('Closing open session')) {
      const cleanMsg = '🔄 Signal Protocol: Updating encryption session...\n';
      return originalStdoutWrite.call(this, Buffer.from(cleanMsg), encoding, callback);
    }
    
    if (typeof callback === 'function') callback();
    return true;
  }
  
  return originalStdoutWrite.call(this, chunk, encoding, callback);
};

console.error = function(...args) {
  const msg = args.join(' ');
  
  if (FILTER_PATTERNS.some(pattern => msg.includes(pattern))) {
    if (msg.includes('Bad MAC')) {
      originalLog(chalk.yellow('🔒 Signal Protocol: Updating encryption session...'));
    }
    return;
  }
  
  originalError.apply(console, args);
};

console.log = function(...args) {
  const msg = args.join(' ');
  
  if (FILTER_PATTERNS.some(pattern => msg.includes(pattern))) {
    return;
  }
  
  originalLog.apply(console, args);
};

const authDir = path.join(process.cwd(), 'session');

function centerText(text) {
  const lines = text.split('\n');
  const width = process.stdout.columns;
  return lines
    .map(line => {
      const pad = Math.max(0, Math.floor((width - line.length) / 2));
      return ' '.repeat(pad) + line;
    })
    .join('\n');
}

function showBanner() {
  console.clear();
  const text = figlet.textSync('Bot - Store', { font: 'Slant' });
  console.log(chalk.cyanBright(centerText(text)));

  const desc = 'WhatsApp bot store for selling products';
  const line = '─'.repeat(desc.length);
  console.log(chalk.greenBright(centerText(desc)));
  console.log(chalk.gray(centerText(line)) + '\n');
}

async function startBot() {
  showBanner();
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
  });

  wrapSendMessageGlobally(sock);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(chalk.greenBright('✅ Connected to WhatsApp!'));
      console.log(chalk.cyan(`👤 User: ${sock.user?.id || 'Unknown'}`));
    } else if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log(chalk.yellow('🔁 Connection lost. Reconnecting...'));
        startBot();
      } else {
        console.log(chalk.red('❌ Invalid session. Please delete the session folder and try again.'));
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('messages.upsert', m => {
    const msg = m.messages?.[0];
    if (!msg || msg.key.fromMe) return;

    console.log(chalk.blueBright('💬 Incoming message from:'), msg.key.remoteJid);
    console.log(chalk.magenta('📨 Message type:'), Object.keys(msg.message || {}));

    try { handler(sock, msg); } catch (err) {
      console.error(chalk.red('[Handler Error]'), err);
    }
  });

  const files = fs.readdirSync(authDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    let waNumber;
    try {
      const response = await inquirer.prompt([
        {
          type: 'input',
          name: 'waNumber',
          message: chalk.cyanBright('📱 Enter your WhatsApp number (without +):'),
          validate: (input) => /^\d{8,}$/.test(input) ? true : '⚠️ Invalid number.',
        },
      ]);
      waNumber = response.waNumber;
    } catch (err) {
      if (err.name === 'ExitPromptError') {
        console.log(chalk.red('\n⚠️ Prompt canceled by user. Exiting...'));
        process.exit(0);
      } else {
        throw err;
      }
    }
  
    try {
      const code = await sock.requestPairingCode(waNumber);
      console.log(chalk.greenBright('\n✅ Pairing Code Found!'));
      console.log(chalk.yellowBright('📌 Code:'), chalk.bold.magenta(code));
      console.log(chalk.cyan('📱 On WhatsApp: Linked Devices → Link a Device'));
      console.log(chalk.greenBright('⏳ Waiting for automatic connection...'));
    } catch (error) {
      console.error(chalk.red('❌ Error requesting pairing code:'), error);
    }
  }
}

startBot();
