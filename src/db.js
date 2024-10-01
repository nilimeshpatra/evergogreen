/**
 * @copyright 2024 Nilimesh Patra
 *
 * This file is part of the EverGoGreen project.
 *
 * This Project is licensed under the MIT License.
 * See the LICENSE file for more information.
 */
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { dbName, admins } = require('../config.json').sqlite3;

function createConnection() {
  const db = new sqlite3.Database(`${dbName}.db`, (err) => {
    if (err) {
      console.error(err.message);
    }
    createTables(db);
  });
  return db;
}

function createTables(db) {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(50) NOT NULL,
        address VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        username VARCHAR(32) UNIQUE,
        password VARCHAR(32) NOT NULL,
        role VARCHAR(11) CHECK (role IN ('Admin', 'User'))
      )
    `);
    admins.forEach((admin) => {
      const { name, address, email, username, password } = admin;
      db.get('SELECT 1 FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          console.error(err.message);
        } else if (!row) {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              return console.error(err.message);
            }

            db.run("INSERT INTO users (name, address, email, username, password, role) VALUES (?, ?, ?, ?, ?, 'Admin')", [name, address, email, username, hash], function (err) {
              if (err) {
                return console.error(err.message);
              }
              console.log(`Inserted a row with the ID: ${this.lastID}`);
            });
          });
        }
      });
    });
    db.run(`
      CREATE TABLE IF NOT EXISTS vhi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author INTEGER NOT NULL,
        location VARCHAR(30) NOT NULL,
        vhi_value INTEGER NOT NULL,
        date DATE NOT NULL,
        vegetation_type VARCHAR(11) CHECK (vegetation_type IN ('Forest', 'Grassland', 'Crop', 'Other'))
      )
    `);
  });
}

module.exports = createConnection();
