const irc = require('irc');
const fs = require('fs');
const path = require('path');
const ini = require('ini');
const debug = require('debug');
const tls = require('tls');

// Load bot information from the ini file
const botConfig = ini.parse(fs.readFileSync('bot.ini', 'utf-8'));

// Create debug instances for server, client, and raw messages
const debugServer = debug('irc-bot:server');
const debugClient = debug('irc-bot:client');
const debugRaw = debug('irc-bot:raw');

// Create IRC client with SSL support
const options = {
  channels: botConfig.channels || [],
  secure: botConfig.ssl || false, // Set to true if SSL is enabled
  port: botConfig.port || (botConfig.ssl ? 6697 : 6667),
  selfSigned: true, // Adjust according to your SSL certificate configuration
};

if (botConfig.ssl) {
  options.connection = tls;
}

const client = new irc.Client(botConfig.server, botConfig.nickname, options);

// Load and initialize modules
const modulesDir = path.join(__dirname, 'mods');
const moduleFiles = fs.readdirSync(modulesDir).filter(file => file.endsWith('.js'));

moduleFiles.forEach(file => {
  const modulePath = path.join(modulesDir, file);
  const moduleName = path.basename(file, '.js');
  const moduleDebug = debug(`irc-bot:module:${moduleName}`);
  moduleDebug(`Loading module: ${moduleName}`);
  require(modulePath)(client, moduleDebug);
});

// Handle server messages
client.addListener('raw', function (message) {
  debugRaw('Received from server:', message);
  debugServer('Received from server:', message);
});

// Handle client messages
client.addListener('message', function (from, to, message) {
  debugClient(`${from} => ${to}: ${message}`);
});

// Handle disconnects
client.addListener('error', function (message) {
  debug('Error:', message);
});

// Handle disconnects
client.addListener('disconnect', function (message) {
  debug('Disconnected:', message);
});

// Handle errors
client.addListener('error', function (message) {
  debug('Error:', message);
});

// Handle join
client.addListener('join', function (channel, nick, message) {
  debug(`${nick} has joined ${channel}`);
});

// Handle server messages
client.addListener('raw', function (message) {
  debug('Received:', message);
});
