import { QueryInterface } from 'sequelize';

import { sequelize } from '../../src/database';

const queryInterface: QueryInterface = sequelize.getQueryInterface();

export async function resetDatabase(): Promise<void> {
  // Truncate all data that might have been affected by the tests
  await queryInterface.sequelize.query('TRUNCATE session, account, account_action;');
}
