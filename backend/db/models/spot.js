'use strict';
const { Model } = require('sequelize');
let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = (sequelize, DataTypes) => {
	class Spot extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Spot.belongsTo(models.User, { foreignKey: 'ownerId' });
			Spot.hasMany(models.Review, { foreignKey: 'spotId' });
			Spot.hasMany(models.SpotImage, { foreignKey: 'spotId' });
			Spot.hasMany(models.Booking, { foreignKey: 'spotId' });
		}
	}
	Spot.init(
		{
			ownerId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			address: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					notEmpty: {
						msg: `Street address is required`,
					},
					// isString(value) {
					// 	if (typeof value !== 'string') {
					// 		throw new Error('Street address must be a string');
					// 	}
					// },
				},
			},
			city: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `City is required`,
					},
					// isString(value) {
					// 	if (typeof value !== 'string') {
					// 		throw new Error('City must be a string');
					// 	}
					// },
				},
			},
			state: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `State is required`,
					},
					// isString(value) {
					// 	if (typeof value !== 'string') {
					// 		throw new Error('State must be a string');
					// 	}
					// },
				},
			},
			country: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `Country is required`,
					},
					// isString(value) {
					// 	if (typeof value !== 'string') {
					// 		throw new Error('Country must be a string');
					// 	}
					// },
				},
			},
			lat: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: {
					// isNumeric: {
					// 	msg: 'Latitude must be a number',
					// },
					max: {
						args: [90],
						msg: `Latitude must be within -90 and 90`,
					},
					min: {
						args: [-90],
						msg: `Latitude must be within -90 and 90`,
					},
				},
			},
			lng: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: {
					// isNumeric: {
					// 	msg: 'Longitude must be a number',
					// },
					max: {
						args: [180],
						msg: `Longitude must be within -180 and 180`,
					},
					min: {
						args: [-180],
						msg: `Longitude must be within -180 and 180`,
					},
				},
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					len: {
						args: [1, 50],
						msg: `Name must be less than 50 characters`,
					},
					// isString(value) {
					// 	if (typeof value !== 'string') {
					// 		throw new Error('Name must be a string');
					// 	}
					// },
				},
			},
			description: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `Description is required`,
					},
					// isString(value) {
					// 	if (typeof value !== 'string') {
					// 		throw new Error('Description must be a string');
					// 	}
					// },
				},
			},
			price: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: {
					// isNumeric: {
					// 	msg: 'Price must be a number',
					// },
					min: {
						args: [0.01],
						msg: `Price per day must be a positive number`,
					},
				},
			},
		},
		{
			sequelize,
			modelName: 'Spot',
			...options,
		}
	);
	return Spot;
};
