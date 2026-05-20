import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: { [key: string]: any } = {};
export default db;

// Assign the promise so other modules can await it
export const dbReady = initialize();

// Get config from environment variables or config.json
function getConfig() {
  return {
    host: process.env.DB_HOST || config.database.host,
    port: parseInt(process.env.DB_PORT || String(config.database.port)),
    user: process.env.DB_USER || config.database.user,
    password: process.env.DB_PASSWORD || config.database.password,
    database: process.env.DB_NAME || config.database.database,
  };
}

async function initialize() {
  const dbConfig = getConfig();
  const { host, port, user, password, database } = dbConfig;

  try {
    // Create DB if it doesn't exist
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end(); // close the temp connection after use

    // Connect with Sequelize
    const sequelize = new Sequelize(database, user, password, {
      dialect: 'mysql',
      host,
      port,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    // Init models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    // Define relationships
    db.Account.hasMany(db.RefreshToken, { foreignKey: 'accountId', onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account, { foreignKey: 'accountId' });

    // Sync tables
    return sequelize.sync({ alter: true }); // alter:true updates columns without dropping data
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}