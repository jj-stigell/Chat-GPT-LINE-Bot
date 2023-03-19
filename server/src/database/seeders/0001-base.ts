import fs from 'fs';
import path from 'path';
import { QueryInterface, Transaction } from 'sequelize';

const language: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mockData/language.sql'), 'utf8'
);

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(language, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('language', {}, { transaction });

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE language_id_seq RESTART;', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  },
};