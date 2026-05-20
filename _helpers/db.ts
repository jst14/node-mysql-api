import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: { [key: string]: any } = {};
export default db;

let initialized = false;
let initPromise: Promise<boolean> | null = null;

function getConfig() {
  const ssl = process.env.DB_SSL !== 'false';
  return {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'node_mysql_api',
    ssl,
  };
}

async function initialize() {
  if (initialized) return true;

  const { host, port, user, password, database, ssl } = getConfig();

  console.log('DB config → host:', host, '| port:', port, '| db:', database, '| ssl:', ssl);
  console.log('Initializing database connection...');

  const sequelize = new Sequelize(database, user, password, {
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    host,
    port,
    logging: false,
    pool: { max: 2, min: 0, acquire: 8000, idle: 3000 },
    dialectOptions: ssl ? { ssl: { rejectUnauthorized: false } } : {},
  });

  db.Account      = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);
  db.sequelize    = sequelize;
  db.Sequelize    = Sequelize;

  db.Account.hasMany(db.RefreshToken, { foreignKey: 'accountId', onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account, { foreignKey: 'accountId' });

  await sequelize.authenticate();
  console.log('DB authenticated — initialization complete');

  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: true });
    console.log('DB synced (dev)');
  }

  initialized = true;
  return true;
}

// Call once — subsequent calls reuse the same promise
export function getDbReady(): Promise<boolean> {
  if (!initPromise) {
    initPromise = initialize().catch((err) => {
      // Reset so next request retries
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

// Keep named export for backward compat but make it lazy
export const dbReady = getDbReady();