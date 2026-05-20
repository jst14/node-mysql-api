import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: { [key: string]: any } = {};
export default db;

export const dbReady = initialize();

function getConfig() {
  const ssl = process.env.DB_SSL !== 'false';
  const dbConfig = {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'node_mysql_api',
    ssl,
  };

  console.log('DB config → host:', dbConfig.host, '| port:', dbConfig.port, '| db:', dbConfig.database, '| ssl:', ssl);
  return dbConfig;
}

async function initialize() {
  const { host, port, user, password, database, ssl } = getConfig();

  try {
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
        acquire: 20000,
        idle: 5000,
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

    if (process.env.NODE_ENV === 'production') {
      await sequelize.authenticate();
      console.log('DB authenticated successfully');
      await sequelize.sync({ alter: true });
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