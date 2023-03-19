import {
  CreationOptional, DataTypes, Model, InferAttributes, InferCreationAttributes, ForeignKey
} from 'sequelize';

import { sequelize } from '..';
import Account from './account';

export default class Session extends Model<
  InferAttributes<Session>,
  InferCreationAttributes<Session>
> {
  declare id: CreationOptional<string>;
  declare accountId: ForeignKey<Account['id']>;
  declare active: CreationOptional<boolean>;
  declare browser: string;
  declare os: string;
  declare device: string;
  declare createdAt: CreationOptional<Date>;
  declare expireAt: Date;
}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'account',
        key: 'id'
      }
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expireAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    updatedAt: false,
    tableName: 'session'
  }
);
