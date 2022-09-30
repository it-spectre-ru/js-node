'use strict';

const { Server } = require('ws');

// приходит роутинг и порт на котором нужно отдавать
module.exports = (routing, port) => {
  // создал сервер вебсокета
  const ws = new Server({ port });

  // как только случается коннекшен
  ws.on('connection', (connection, req) => {
    const ip = req.socket.remoteAddress;
    // подписываемся на событие онмессадж
    connection.on('message', async (message) => {
      // паршу json приходящие с клиента
      const obj = JSON.parse(message);
      // ищу роутинги
      const { name, method, args = [] } = obj;
      const entity = routing[name];
      if (!entity) return connection.send('"Not found"', { binary: false });
      const handler = entity[method];
      if (!handler) return connection.send('"Not found"', { binary: false });
      const json = JSON.stringify(args);
      const parameters = json.substring(1, json.length - 1);
      console.log(`${ip} ${name}.${method}(${parameters})`);
      try {
        // выполняю метод хендлер
        const result = await handler(...args);
        // и его результаты серилизую в json и отправляю на клиента
        connection.send(JSON.stringify(result.rows), { binary: false });
      } catch (err) {
        console.dir({ err });
        connection.send('"Server error"', { binary: false });
      }
    });
  });

  console.log(`API on port ${port}`);
};
