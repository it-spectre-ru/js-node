'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

module.exports = (root, port) => {
  http
    .createServer(async (req, res) => {
      // если обращаюсь к корню , ищу index.html
      const url = req.url === '/' ? '/index.html' : req.url;
      const filePath = path.join(root, url);
      try {
        // читаю файл
        const data = await fs.promises.readFile(filePath);
        // отдаю файл
        res.end(data);
      } catch (err) {
        res.statusCode = 404;
        res.end('"File is not found"');
      }
    })
    .listen(port);

  console.log(`Static on port ${port}`);
};