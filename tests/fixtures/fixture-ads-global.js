const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, '../../app/DadosADS.gs'), 'utf8');
const context = vm.createContext({});
vm.runInContext(code, context);

module.exports = context.CF_ORC_ADS[0];
