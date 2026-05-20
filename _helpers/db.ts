import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: { [key: string]: any } = {};
export default db;

export const dbReady = initialize();

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
  const { host, port, user, password, database, ssl } = getConfig();

  console.log('DB config → host:', host, '| port:', port, '| db:', database, '| ssl:', ssl);
  console.log('Initializing database connection...');

  const sequelize = new Sequelize(database, user, password, {
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    host,
    port,
    logging: false,
    pool: {
      max: 2,
      min: 0,
      acquire: 10000,
      idle: 3000,
    },
    dialectOptions: ssl
      ? { ssl: { rejectUnauthorized: false } }
      : {},
  });

  db.Account      = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);
  db.sequelize    = sequelize;
  db.Sequelize    = Sequelize;

  db.Account.hasMany(db.RefreshToken, { foreignKey: 'accountId', onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account, { foreignKey: 'accountId' });

  try {
    await sequelize.authenticate();
    console.log('DB authenticated successfully');

    // Only run sync in development — tables already exist in production (Aiven)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('DB synced (dev)');
    }

    console.log('Database initialization complete');
    return true;
  } catch (error: any) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
}