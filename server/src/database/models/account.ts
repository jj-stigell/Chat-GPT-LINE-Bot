import {
  CreationOptional, DataTypes, Model, InferAttributes, InferCreationAttributes, ForeignKey
} from 'sequelize';

import { sequelize } from '..';
import Language from './language';

export default class Account extends Model<
  InferAttributes<Account>,
  InferCreationAttributes<Account>
> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare username: string;
  declare emailVerified: CreationOptional<boolean>;
  declare allowNewsLetter: CreationOptional<boolean>;
  declare tosAccepted: CreationOptional<boolean>;
  declare password: string;
  declare member: CreationOptional<boolean>;
  declare languageId: ForeignKey<Language['id']>;
  declare lastLogin: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Account.init(
  {
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
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    allowNewsLetter: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    tosAccepted: {
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
    languageId: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      defaultValue: 'EN',
      references: {
        model: 'language',
        key: 'id'
      }
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'account'
  }
);
