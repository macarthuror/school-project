/**
 * Ingeniria de Software
 * 04/04/2021
 * 
 * Arturo Ortega Robles
 * Diego Antonio Paredes
 */
'use strict';

const crypto = require('crypto');
const consola = require('consola');
const router = require('express').Router();

const { secretKey } = require('../config');

/********************************
 * LOGIN
 ********************************/
router.post('/', async function(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash("error", "No se mando usuario o contraseña");
    res.redirect('/')
    return
  }

  const conn = req.app.get('db')
  const hashPass = crypto.createHmac('sha256', secretKey)
    .update(password)
    .digest('hex');

  try {
    const [user] = await conn.query('SELECT * FROM users WHERE email = ? AND password = ? AND block = 0 LIMIT 1', [email, hashPass], )

    if (!user) {
      req.flash("error", "Usuario o contraseña incorrectos");
      res.redirect('/')
      return
    }

    req.session.loggedin = true;
    req.session.user = user;
    res.redirect('/app');

  } catch (error) {
    consola.error(error);
    req.flash("error", "Error Interno");
    res.redirect('/')
    return
  } finally {
    conn.end();
  }
});

/********************************
 * LOGOUT
 ********************************/
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

module.exports = router
