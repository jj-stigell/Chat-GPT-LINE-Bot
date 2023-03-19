import { Sequelize } from 'sequelize';

// Project imports
import credentials from '../configs/database';
import { NODE_ENV } from '../configs/environment';

export const sequelize: Sequelize = new Sequelize(
  credentials.database,
  credentials.username,
  credentials.password,
  {
    host: credentials.host,
    dialect: 'postgres',
    dialectOptions: NODE_ENV !== 'test' ? {
      ssl: {
        require: true
      }
    } : undefined,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    logging: NODE_ENV === 'development' ? console.log : undefined
  }
);

export const connectToDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('database connected');
  } catch (error) {
    console.log('database connection failed', error);
  }
};
