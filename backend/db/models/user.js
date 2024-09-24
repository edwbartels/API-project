'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Booking, { foreignKey: 'userId' });
      User.hasMany(models.Review, { foreignKey: 'userId' });
    }

    static async hashPassword(password) {
      return await bcrypt.hash(password, 10);
    }

    async validatePassword(password) {
      return await bcrypt.hash(password, 10);
    }

    async validatePassword(password) {
      return await bcrypt.compare(password, this.hashedPassword);
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    hashedPassword: {
      type: DataTypes.STRING,
      allowNull: false,
  }, 
    sequelize,
    modelName: 'User',
  });
  return User;
};