const axios = require('axios');

// Force Axios to use the Node http adapter in Jest environment
// Usamos el require directo para evitar problemas de bundler
try {
  axios.defaults.adapter = require('axios/lib/adapters/http');
} catch (e) {
  console.warn("No se pudo cargar el adaptador HTTP de Axios, intentando fallback a xhr...");
  // Fallback si por alguna razón el paquete es muy restringido
  axios.defaults.adapter = 'xhr';
}