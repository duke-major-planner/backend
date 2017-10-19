'use strict';

const extend = require('lodash').assign;
const mysql = require('mysql');
const config = require('./../config.json');

const options = {
  user: config['MYSQL_USER'],
  password: config['MYSQL_PASSWORD'],
  database: 'bookshelf'
};

if (config['INSTANCE_CONNECTION_NAME'] && config['NODE_ENV'] === 'production') {
  options.socketPath = `/cloudsql/${config['INSTANCE_CONNECTION_NAME']}`;
}

const connection = mysql.createConnection(options);

// [START list]
function list (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT * FROM `books` LIMIT ? OFFSET ?', [limit, token],
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    }
  );
}
// [END list]

// [START create]
function create (data, cb) {
  connection.query('INSERT INTO `books` SET ?', data, (err, res) => {
    if (err) {
      cb(err);
      return;
    }
    read(res.insertId, cb);
  });
}
// [END create]

function read (id, cb) {
  connection.query(
    'SELECT * FROM `books` WHERE `id` = ?', id, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}

// [START update]
function update (id, data, cb) {
  connection.query(
    'UPDATE `books` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      read(id, cb);
    });
}
// [END update]

function _delete (id, cb) {
  connection.query('DELETE FROM `books` WHERE `id` = ?', id, cb);
}

module.exports = {
  createSchema: createSchema,
  list: list,
  create: create,
  read: read,
  update: update,
  delete: _delete
};

if (module === require.main) {
  const prompt = require('prompt');
  prompt.start();

  console.log(
    `Running this script directly will allow you to initialize your mysql database.
    This script will not modify any existing tables.`);
    var configs = {
      user: options.user,
      password: options.password,
    }
    createSchema(configs);
}

function createSchema (config) {
  console.log(`test123`);
  const connection = mysql.createConnection(extend({
    multipleStatements: true
  }, config));

  connection.query(
    `CREATE DATABASE IF NOT EXISTS \`dmp_dev\`
      DEFAULT CHARACTER SET = 'utf8'
      DEFAULT COLLATE 'utf8_general_ci';
    USE \`dmp_dev\`;
    CREATE TABLE IF NOT EXISTS \`dmp_dev\`.\`test_table\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(255) NULL,
      \`data\` INT NOT NULL,
      \`createdBy\` VARCHAR(255) NULL,
      \`createdById\` VARCHAR(255) NULL,
    PRIMARY KEY (\`id\`));
    INSERT INTO test_table (name, data)
    VALUES ('Aman', 100);`,
    (err) => {
      if (err) {
        throw err;
      }
      console.log('Successfully created schema');
      connection.end();
    }
  );
}