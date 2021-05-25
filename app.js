/**
 * Ingeniria de Software
 * 04/04/2021
 * 
 * Arturo Ortega Robles
 * Diego Antonio Paredes
 */
'use strict';

const express = require('express');
const flash   = require('connect-flash');
const session = require('express-session');
const compression = require('compression');

const { secretKey } = require('./config');

const app = express();
const appRoutes = require('./routes/app.routes');
const authRoutes = require('./routes/auth.routes');

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(session({
    resave: true,
	secret: secretKey,
	saveUninitialized: true,
    cookie: { maxAge: 7200000 },
}));
app.use(compression());
app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.myPath = req.path;
    res.locals.menu = [
        {
            name: 'Dashboard',
            icon: 'home',
            path: '/app'
        },
        {
            name: 'Productos',
            icon: 'shopping-cart',
            path: '/app/productos'
        },
        {
            name: 'Clientes',
            icon: 'users',
            path: '/app/clientes'
        },
        {
            name: 'Ordenes',
            icon: 'file',
            path: '/app/ordenes'
        }
    ];
    next();
});
app.use(function (req, res, next) {
    if (req.method === 'GET'
        && req.path === '/'
        && req.session.loggedin
    ){
        res.redirect('/app');
    } else {
        next();
    }
});

app.set('view engine', 'ejs');
app.use('/static', express.static('public', { maxAge: 31557600 }));

app.use('/app', appRoutes);
app.use('/auth', authRoutes);

app.get('/', function(req, res) {
    res.render('pages/index');
});
app.get('*', function(req, res){
    res.status(404).render('pages/404');
});


module.exports = app;
