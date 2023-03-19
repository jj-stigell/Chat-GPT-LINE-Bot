import { DataTypes, QueryInterface, Transaction } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('language', {
        id: {
          type: DataTypes.CHAR(2),
          primaryKey: true,
          allowNull: false
        },
        language_english: {
          type: DataTypes.STRING,
          allowNull: false
        },
        language_native: {
          type: DataTypes.STRING,
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });
      await queryInterface.createTable('account', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email: {
          type: DataTypes.STRING(255),
          unique: true,
          allowNull: false,
          validate: {
            isEmail: true
          }
        },
        username: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false
        },
        email_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        allow_news_letter: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        tos_accepted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        password: {
          type: DataTypes.CHAR(255),
          allowNull: false
        },
        member: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        language_id: {
          type: DataTypes.CHAR(2),
          allowNull: false,
          defaultValue: 'EN',
          references: {
            model: 'language',
            key: 'id'
          }
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });
      await queryInterface.createTable('session', {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        account_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'account',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        browser: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        os: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        device: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        expire_at: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }, { transaction });
      await queryInterface.createTable('account_action', {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        account_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'account',
            key: 'id'
          }
        },
        type: {
          type: DataTypes.ENUM('CONFIRM_EMAIL', 'RESET_PASSWORD'),
          allowNull: false
        },
        expire_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('account_action', { transaction });
      await queryInterface.dropTable('session', { transaction });
      await queryInterface.dropTable('account', { transaction });
      await queryInterface.dropTable('language', { transaction });
      await queryInterface.dropTable('migrations', { transaction });
      await queryInterface.dropTable('seeds', { transaction });

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_account_action_type;', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  }
};
