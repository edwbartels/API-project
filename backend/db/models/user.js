'use strict';
const { Model, Validator } = require('sequelize');
let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			User.hasMany(models.Spot, { foreignKey: 'ownerId' });
			User.hasMany(models.Booking, { foreignKey: 'userId' });
			User.hasMany(models.Review, { foreignKey: 'userId' });
		}
	}
	User.init(
		{
			firstName: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `First Name is required`,
					},
				},
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `Last Name is required`,
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
					isEmail: {
						msg: 'Invalid email',
					},
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
					notEmpty: {
						msg: 'Username is required',
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
			...options,
		}
	);
	return User;
};
