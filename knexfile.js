// Update with your config settings.
const path = require('node:path');

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'better-sqlite3',

    connection: {
      filename: path.join(__dirname, 'data', 'bookclub.db'),
    },

    useNullAsDefault: true,

    pool: {
      afterCreate: (connection, done) => {
        connection.pragma('foreign_keys = ON');
        connection.pragma('busy_timeout = 5000');
        connection.pragma('journal_mode = WAL');

        done(null, connection);
      },
    },

    migrations: {
      directory: path.join(__dirname, 'migrations'),
    }
  },

  production: {
    client: 'better-sqlite3',

    connection: {
      filename: path.join(__dirname, 'data', 'bookclub.db'),
    },

    useNullAsDefault: true,

    pool: {
      afterCreate: (connection, done) => {
        connection.pragma('foreign_keys = ON');
        connection.pragma('busy_timeout = 5000');
        connection.pragma('journal_mode = WAL');

        done(null, connection);
      },
    },
    
    migrations: {
      directory: path.join(__dirname, 'migrations'),
    }
  },
};
