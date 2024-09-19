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
			firstName: {
				type: DataTypes.STRING,
			},
			lastName: {
				type: DataTypes.STRING,
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
					// len: [3, 256],
					isEmail: true,
				},
			},
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					// len: [4, 30],
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
			hashedPassword: {
				type: DataTypes.STRING.BINARY,
				allowNull: false,
				validate: {
					len: {
						args: [60, 60],
						msg: 'String must be 60 characters',
					},
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
