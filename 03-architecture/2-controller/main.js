'use strict';

const http = require('node:http');
const pg = require('pg');
const hash = require('./hash.js');
const receiveArgs = require('./body.js');

const PORT = 8000;

const pool = new pg.Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'example',
  user: 'postgres',
  password: 'postgres',
});

const routing = {
  user: {
    get(id) {
      if (!id) return pool.query('SELECT id, login FROM users');
      const sql = 'SELECT id, login FROM users WHERE id = $1';
      return pool.query(sql, [id]);
    },

    async post({ login, password }) {
      const sql = 'INSERT INTO users (login, password) VALUES ($1, $2)';
      const passwordHash = await hash(password);
      return pool.query(sql, [login, passwordHash]);
    },

    async put(id, { login, password }) {
      const sql = 'UPDATE users SET login = $1, password = $2 WHERE id = $3';
      const passwordHash = await hash(password);
      return pool.query(sql, [login, passwordHash, id]);
    },

    delete(id) {
      const sql = 'DELETE FROM users WHERE id = $1';
      return pool.query(sql, [id]);
    },
  },
};
// пишу createServer , сюда приходит request и response
http
  .createServer(async (req, res) => {
    // забираю method из htttp request/ забираю url и socket
    const { method, url, socket } = req;
    // распарсил url - чтобы выделить имя сущности (user) который хочу вызывать
    const [name, id] = url.substring(1).split('/');
    // читаю из роутинга с каким энтити работаю
    const entity = routing[name];
    // если не нашел , не могу дальше работать
    if (!entity) return res.end('Not found');
    // читаю из энтити какой метод вызван. --> беру http'шный метод и превращаю в нижний регистр. имя метода из ключа
    const handler = entity[method.toLowerCase()];
    // если хендлера не нашел , стоп
    if (!handler) return res.end('Not found');
    // хочу распарсить тело хендлера, чтобы посмотреть аргументы.
    // handler.toString() - возвращает исходный код
    const src = handler.toString();
    // выпарсил сигнатуру - отрезал все до  - indexOf(')') -- "async put(id, { login, password })"
    const signature = src.substring(0, src.indexOf(')'));
    // готовлю массив аргументов
    const args = [];
    // если в сигнатуре есть id, то пушаю его в массив
    if (signature.includes('(id')) args.push(id);
    // вызываю ф-ю, receiveArgs (умеет вычитать из сокета JSON )>  вернет JSON,
    // который с http запросом пришел на сервер, в нем остальные аргументы
    // эти аргументы пушаю в массив аргументов
    if (signature.includes('{')) args.push(await receiveArgs(req));
    console.log(`${socket.remoteAddress} ${method} ${url}`);
    // вызываю хендлер, передаю туда массив аргументов,
    // распаковываю его в список аргументов из массива
    const result = await handler(...args);
    // исполнился хендлер , и то что он нам вернул превратил в JSON.stringify в JSON обект и вернул в сокет
    res.end(JSON.stringify(result.rows));
  })
  .listen(PORT);

console.log(`Listen on port ${PORT}`);
