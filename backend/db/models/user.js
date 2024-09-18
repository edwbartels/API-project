'use strict';
const { Model, Validator } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	User.init(
		{
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					len: {
						args: [4, 30],
						msg: 'String length must be between 4 and 30 characters',
					},
					isNotEmail(value) {
						if (Validator.isEmail(value)) {
							throw new Error('Cannot be an email.');
						}
					},
				},
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					len: {
						args: [3, 256],
						msg: 'String length much be between 3 and 256 characters',
					},
					isEmail: true,
				},
			},
			hashedPassword: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					args: [60, 60],
					msg: 'String must be 60 characters',
				},
			},
		},
		{
			sequelize,
			modelName: 'User',
		}
	);
	return User;
};
