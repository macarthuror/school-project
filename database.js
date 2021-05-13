/**
 * Ingeniria de Software
 * 04/04/2021
 * 
 * Arturo Ortega Robles
 * Diego Antonio Paredes
 */
'use strict';

const crypto = require('crypto');
const mariadb = require('mariadb');
const consola = require('consola');
const { secretKey, db } = require('./config');

let connection;
const pool = mariadb.createPool({
  ...db,
  connectionLimit: 5
});

async function DBConnection(app) {
  try {
    connection = await pool.getConnection();
    consola.success('Conexión a base de datos ✅\n');
    await createTables();
    await createData();
  } catch (error) {
    throw new Error('Error al conectar con base de datos');
  } finally {
    app.set('db', connection);
  }
}

async function createTables() {
  consola.info('Verificación y creación de Tablas');
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(30) NOT NULL,
        paterno VARCHAR(30) NOT NULL,
        materno VARCHAR(30) NOT NULL,
        email VARCHAR(50) UNIQUE,
        password VARCHAR(255) NOT NULL,
        block INT(1) DEFAULT 0,
        reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    consola.success('Tabla de USUARIOS creada ✔');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(30) NOT NULL,
        direccion TEXT NOT NULL,
        reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    consola.success('Tabla de CLIENTES creada ✔');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        customer_id INT UNSIGNED NOT NULL,
        reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        constraint fk_type
        foreign key(customer_id) 
            references customers(id)
      )
    `);
    consola.success('Tabla de ORDENES creada ✔');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(30) NOT NULL,
        descripcion TEXT NOT NULL,
        precio FLOAT NOT NULL,
        status INT(1) DEFAULT 1,
        reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    consola.success('Tabla de PRODUCTOS creada ✔');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_order (
        product_id INT(6) UNSIGNED NOT NULL,
        order_id INT(6) UNSIGNED NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        PRIMARY KEY (product_id, order_id)
      ) ENGINE = InnoDB;
    `);
    consola.success('Tabla de PRODUCTOS_ORDENES creada ✔');
    consola.log('🔥Tablas creadas correctamente🔥\n');

  } catch (error) {
    consola.error('Error creación de tablas \n', error);
    throw new Error('Error al crear las tablas');
  }
}

async function createData() {
  consola.info('Información de prueba');
  try {
    const hashedStr = crypto.createHmac('sha256', secretKey)
    .update('password')
    .digest('hex');

    await connection.query(`
      INSERT INTO users (nombre, paterno, materno, email, password) VALUES ('Pedro', 'Paramo', 'Perez', 'admin@domain.com', '${hashedStr}')
    `);
    consola.success('Usuario administrador creado correctamente ✔');
    
    await connection.query(`
      INSERT INTO products (titulo, descripcion, precio) VALUES 
      ('Laptop', 'Computadora portatil', 12000),
      ('Teclado', 'Teclado alambrico para computadora', 200),
      ('Tablet', 'Tablet ultra portatil', 6000),
      ('Ratón inalambrico', 'Raton inalambrico paracomputadora', 150)

    `);
    consola.success('Productos de prueba creados correctamente ✔');

    await connection.query(`
      INSERT INTO customers (nombre, direccion) VALUES 
      ('Pepe', 'Direccion 1'),
      ('Maria', 'Direccion 2'),
      ('Juana', 'Direccion 3'),
      ('Antonio', 'Direccion 4')

    `);
    consola.success('Clientes de prueba creados correctamente ✔');

    await connection.query(`
      INSERT INTO orders (customer_id) VALUES 
      (1),
      (2),
      (1),
      (1)

    `);
    await connection.query(`
      INSERT INTO product_order (product_id, order_id) VALUES 
      (1, 1),
      (2, 1),
      (3, 1),
      (4, 1),
      (1, 2),
      (2, 2),
      (3, 3),
      (4, 3)

    `);
    consola.success('Ordenes de prueba creados correctamente ✔\n');

  } catch (error) {
    consola.success('El Usuario con el correo admin@domain.com ya existe');
    consola.success('Información de prueba creada correctamente\n');
    // consola.error(error)
  }
}

module.exports = DBConnection;
