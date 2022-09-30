'use strict';

const socket = new WebSocket('ws://127.0.0.1:8001/');

const scaffold = (structure) => {
  // создаю объект апи
  const api = {};
  // добавляю в него все сущности
  const services = Object.keys(structure);
  // к каждой сущности добавляю методы
  for (const serviceName of services) {
    api[serviceName] = {};
    const service = structure[serviceName];
    const methods = Object.keys(service);
    for (const methodName of methods) {
      // создаю структуру из имени сервиса и имени метода внутри
      api[serviceName][methodName] = (...args) =>
        // перехватываю все запросы
        new Promise((resolve) => {
          const packet = { name: serviceName, method: methodName, args };
          // и отправляю через json формат на серверную сторону
          socket.send(JSON.stringify(packet));
          socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            resolve(data);
          };
        });
    }
  }
  return api;
};

const api = scaffold({
  user: {
    create: ['record'],
    read: ['id'],
    update: ['id', 'record'],
    delete: ['id'],
    find: ['mask'],
  },
});

socket.addEventListener('open', async () => {
  const data = await api.user.read(3);
  const stts = await api.user.read(6);
  console.dir({ data });
  console.dir({ stts });
});
