// jest.setup.js
// 1. Inyectamos XMLHttpRequest globalmente para que Axios lo detecte
const XMLHttpRequest = require('xhr2');
global.XMLHttpRequest = XMLHttpRequest;

// 2. Forzamos a Axios a usar el adaptador XHR globalmente en tests
const axios = require('axios');
axios.defaults.adapter = 'xhr';