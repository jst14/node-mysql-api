import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: { [key: string]: any } = {};
export default db;

export const dbReady = initialize();

function getConfig() {
  const ssl = process.env.DB_SSL === 'true';
  const dbConfig = {
    host:     process.env.DB_HOST     || config.database.host,
    port:     parseInt(process.env.DB_PORT || String(config.database.port)),
    user:     process.env.DB_USER     || config.database.user,
    password: process.env.DB_PASSWORD || config.database.password,
    database: process.env.DB_NAME     || config.database.database,
    ssl,
  };

  console.log('DB config → host:', dbConfig.host, '| port:', dbConfig.port, '| db:', dbConfig.database, '| ssl:', ssl);
  return dbConfig;
}

async function initialize() {
  const { host, port, user, password, database, ssl } = getConfig();
  const sslOptions = ssl ? { rejectUnauthorized: false } : undefined;

  try {
    console.log('Initializing database connection...');

    // Step 1: Connect to MySQL server and ensure DB exists
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ssl: sslOptions,
    });
    console.log('Connected to MySQL server');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    console.log('Database ensured:', database);
    await connection.end();

    // Step 2: Connect Sequelize to the database
    const sequelize = new Sequelize(database, user, password, {
      dialect: 'mysql',
      host,
      port,
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions: sslOptions
        ? { ssl: sslOptions }
        : {},
    });

    // Step 3: Init models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    // Step 4: Relationships
    db.Account.hasMany(db.RefreshToken, { foreignKey: 'accountId', onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account, { foreignKey: 'accountId' });

    // Step 5: Sync
    console.log('Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('Database initialization complete');

    return true;
  } catch (error: any) {
    console.error('Database initialization failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}