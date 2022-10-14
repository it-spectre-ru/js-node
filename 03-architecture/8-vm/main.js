'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const server = require('./ws.js');
const staticServer = require('./static.js');
const load = require('./load.js');
const db = require('./db.js');
const hash = require('./hash.js');

// создаю sandbox, добавляю ссылку на console.log
// добавляю идентификатор db common
// теперь в любом месте приложения могу писать db. что -то, common.hash
// все что есть в этом глобальном объекте 1. могу менять глобальный namespace - он фризится (loader)
const sandbox = { console, db: Object.freeze(db), common: { hash } };
// подгружаю все api
const apiPath = path.join(process.cwd(), './api');
const routing = {};

(async () => {
  const files = await fsp.readdir(apiPath);

  // прохожусь по коллекции файлов
  for (const fileName of files) {
    if (!fileName.endsWith('.js')) continue;
    const filePath = path.join(apiPath, fileName);
    const serviceName = path.basename(fileName, '.js');
    // каждую эту апишку, теперь заменили require заменил на свой loader
    routing[serviceName] = await load(filePath, sandbox);
  }

  staticServer('./static', 8000);
  server(routing, 8001);
})();
