import config from '../config.json';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: { [key: string]: any } = {};
export default db;

export const dbReady = initialize();

function getConfig() {
  const ssl = process.env.DB_SSL !== 'false'; // default TRUE for Aiven
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

  try {
    console.log('Initializing database connection...');

    // Skip CREATE DATABASE — Aiven pre-creates 'defaultdb' and
    // avnadmin does not have CREATE DATABASE privileges.
    // Sequelize connects directly to the existing database.

    const sequelize = new Sequelize(database, user, password, {
      dialect: 'mysql',
      dialectModule: require('mysql2'), // force bundled mysql2 on Vercel
      host,
      port,
      logging: false, // reduce log noise in production
      pool: {
        max: 2,        // keep low — Vercel is serverless, not persistent
        min: 0,
        acquire: 20000,
        idle: 5000,
      },
      dialectOptions: ssl
        ? { ssl: { rejectUnauthorized: false } } // Aiven uses self-signed CA
        : {},
    });

    // Init models
    db.Account      = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);
    db.sequelize    = sequelize;
    db.Sequelize    = Sequelize;

    // Relationships
    db.Account.hasMany(db.RefreshToken, { foreignKey: 'accountId', onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account, { foreignKey: 'accountId' });

    // Sync — use alter:true only in dev; in prod just authenticate
    if (process.env.NODE_ENV === 'production') {
      await sequelize.authenticate();
      console.log('DB authenticated successfully');
      await sequelize.sync({ alter: true }); // still sync so tables are created
    } else {
      await sequelize.sync({ alter: true });
    }

    console.log('Database initialization complete');
    return true;
  } catch (error: any) {
    console.error('Database initialization failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}