import Language from './language';
import Account from './account';
import AccountAction from './accountAction';
import Session from './session';

Account.hasMany(AccountAction, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

AccountAction.belongsTo(Account, {
  targetKey: 'id',
  foreignKey: 'accountId'
});

Account.hasOne(Language, {
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE'
});

Language.belongsTo(Account, {
  targetKey: 'id',
  foreignKey: 'languageId'
});

Account.hasMany(Session, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Session.belongsTo(Account, {
  targetKey: 'id',
  foreignKey: 'accountId'
});

export default {
  Account,
  AccountAction,
  Language,
  Session
};
