/**
 * Ingeniria de Software
 * 04/04/2021
 * 
 * Arturo Ortega Robles
 * Diego Antonio Paredes
 */
'use strict';

const app = require('./app');
const consola = require('consola');
const database = require('./database');
const { port } = require('./config') ;

(async function() {
  try {
    await database(app);
    app.listen(port, () => {
      consola.ready(
        '==============================\n',
        `La aplicación se está ejecutando en:\n http://localhost:${port}`,
        '\n====================================\n'
      );
  });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
