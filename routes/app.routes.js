
/**
 * Ingeniria de Software
 * 04/04/2021
 * 
 * Arturo Ortega Robles
 * Diego Antonio Paredes
 */
'use strict';

const consola = require('consola');
const router = require('express').Router();

router.use((req, res, next) => {
  if (!req.session.loggedin || !req.session.user) {
    req.session.user = null;
    req.session.loggedin = null;
    res.redirect('/');
    res.end();
  } else {
    next();
  }
})

router.get('/', function(req, res) {
  res.render('pages/app/index');
});

/********************************
 * PRODUCTOS
 ********************************/
router.get('/productos', async function(req, res) {
  const { like, deleted } = req.query;
  const conn = req.app.get('db');
  if (!like) {
    const productos = await conn.query(`SELECT * FROM products ${deleted ? '' : 'WHERE status = 1'} LIMIT 100`);
    delete productos.meta;
    return res.render('pages/app/products', { productos });
  } else {
    const productos = await conn.query(`SELECT * FROM products WHERE titulo LIKE '%${like}%' ${deleted ? '' : 'AND status = 1'} LIMIT 100`);
    delete productos.meta;
    return res.render('pages/app/products', { productos });
  }
});

router.get('/productos/nuevo', function(req, res) {
  res.render('pages/app/productos/new');
});

router.post('/productos/nuevo', async function(req, res) {
  const { titulo, precio, descripcion } = req.body;

  if (!titulo || !precio || !descripcion) {
    req.flash("error", "No se han mandado todos los parametros necesarios");
    res.redirect('back')
    return
  }

  const conn = req.app.get('db');
  try {
    await conn.query(`
      INSERT INTO products (titulo, descripcion, precio) VALUES 
      ('${titulo}', '${descripcion}', ${precio})
    `);
    return res.redirect('/app/productos')
  } catch (error) {
    consola.error(error);
    req.flash("error", "Error al guardar el producto");
    res.redirect('back')
    return
  }
});

router.delete('/productos/:id', async function(req, res) {
  const { id } = req.params;
  const { reactive } = req.query;

  if (!id) {
    req.flash("error", "No se han mandado todos los parametros necesarios");
    return res.redirect('/app/productos')
  }

  const conn = req.app.get('db');
  try {
    await conn.query(`
      UPDATE products SET status = ${reactive ? '1' : '0'} WHERE id=${id};
    `);
    return res.status(200).json('Eliminado con exito');
  } catch (error) {
    consola.error(error);
    req.flash("error", "Error al guardar el producto");
    res.redirect('back')
    return
  }
});

/********************************
 * CLIENTES
 ********************************/
router.get('/clientes', async function(req, res) {
  const conn = req.app.get('db');
  const clientes = await conn.query('SELECT * FROM customers LIMIT 100');
  delete clientes.meta;
  res.render('pages/app/clients', { clientes });
});

/********************************
 * ORDENES
 ********************************/
router.get('/ordenes', async function(req, res) {
  const conn = req.app.get('db');
  const ordenes = await conn.query('SELECT orders.id, customers.nombre FROM orders INNER JOIN customers ON orders.customer_id=customers.id LIMIT 100');
  delete ordenes.meta;
  res.render('pages/app/orders', { ordenes });
});


module.exports = router;

