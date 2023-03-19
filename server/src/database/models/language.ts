
import {
  CreationOptional, DataTypes, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';

export default class Language extends Model<
  InferAttributes<Language>,
  InferCreationAttributes<Language>
> {
  declare id: CreationOptional<string>;
  declare languageEnglish: string;
  declare languageNative: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Language.init(
  {
    id: {
      type: DataTypes.CHAR(2),
      primaryKey: true,
      allowNull: false
    },
    languageEnglish: {
      type: DataTypes.STRING,
      allowNull: false
    },
    languageNative: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'language'
  }
);
