'use strict';

// подгружаю модуль fs втроенный в ноду, беру интерфейс промисов
const fsp = require('node:fs').promises;
const path = require('node:path');
const server = require('./ws.js');
const staticServer = require('./static.js');

// беру путь к папке api
const apiPath = path.join(process.cwd(), './api');
const routing = {};

(async () => {
  // считываю каталог api
  const files = await fsp.readdir(apiPath);
  // прохожусь там по файлам
  for (const fileName of files) {
    // если файл не js выпрыгиваем
    if (!fileName.endsWith('.js')) continue;
    // подгружаем рекваером и добавляю в роутинг файл js
    // строю роутинг динамически по содержимому папки api
    const filePath = path.join(apiPath, fileName);
    const serviceName = path.basename(fileName, '.js');
    routing[serviceName] = require(filePath);
  }

  staticServer('./static', 8000);
  server(routing, 8001);
})();
