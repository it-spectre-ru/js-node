'use strict';

const fs = require('node:fs').promises;
const vm = require('node:vm');

const RUN_OPTIONS = { timeout: 5000, displayErrors: false };

// сюда передаю файл и sandbox
module.exports = async (filePath, sandbox) => {
  const src = await fs.readFile(filePath, 'utf8');
  const code = `'use strict';\n${src}`;
  const script = new vm.Script(code);
  console.log({ script });
  // при помощи createContext new vm.Script создаю исполняемый код
  const context = vm.createContext(Object.freeze({ ...sandbox }));
  const exported = script.runInContext(context, RUN_OPTIONS);
  console.log({ exported });
  // и этот код экспортирую из load
  return exported;
};

// практически сделал свой require , позволяет подгрузить любой файл из папки api
