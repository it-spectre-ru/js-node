'use strict';

const fs = require('node:fs').promises;
const vm = require('node:vm');

const RUN_OPTIONS = { timeout: 5000, displayErrors: false };

const pseudoRequire = (name) => {
  console.log(`Intercepted require: ${name}`);
};

// заменитель require. Асинхронная функция. На вход принимает имя файла и контекст, который будет считаться глобальным внутри этого файла
const load = async (filePath, sandbox) => {
  //считываю содержимое этого файла. говорим что оно в utf кодировке
  //жду пока промис все это вернет
  const src = await fs.readFile(filePath, 'utf8');
  // оборачиваю исходник считанный из файла в конструкцию. стрелочную функцию
  const code = `(require, module, __filename, __dirname) => {\n${src}\n}`;
  // получил экземпляр скрипта
  const script = new vm.Script(code);
  // создаю контекст для исполнения скрипта. перепаковал , зафризил контекст sandbox, получил новый глобал
  const context = vm.createContext(Object.freeze({ ...sandbox }));
  // исполнил скрипт и получил обертку. ссылка на функцию , которую задали в виде строки
  const wrapper = script.runInContext(context, RUN_OPTIONS);
  const module = {};
  wrapper(pseudoRequire, module, filePath, __dirname);
  return module.exports;
};

const main = async () => {
  const sandbox = { Map: class PseudoMap {} };
  const exported = await load('./1-export.js', sandbox);
  console.log(exported);
};

main();
