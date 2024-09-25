'use strict';
const { Model } = require('sequelize');
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
				},
			},
			city: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `City is required`,
					},
				},
			},
			state: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `State is required`,
					},
				},
			},
			country: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `Country is required`,
					},
				},
			},
			lat: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: {
					len: {
						args: [-90, 90],
						msg: `Latitude must be within -90 and 90`,
					},
				},
			},
			lng: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: {
					len: {
						args: [-180, 180],
						msg: `Longitude must be within -180 and 180`,
					},
				},
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					max: {
						args: [50],
						msg: `Name must be less than 50 characters`,
					},
				},
			},
			description: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: ` Description is required`,
					},
				},
			},
			price: {
				type: DataTypes.DECIMAL,
				allowNull: false,
				validate: {
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
		}
	);
	return Spot;
};
