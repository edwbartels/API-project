'use strict';
const { Model } = require('sequelize');
let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = (sequelize, DataTypes) => {
	class Booking extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Booking.belongsTo(models.User, { foreignKey: 'userId' });
			Booking.belongsTo(models.Spot, { foreignKey: 'spotId' });
		}
	}
	Booking.init(
		{
			spotId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			startDate: {
				type: DataTypes.DATE,
				allowNull: false,
				validate: {
					isDate: {
						msg: `startDate must be a valid date`,
					},
					isFuture(value) {
						if (new Date(value) < new Date()) {
							throw new Error('Start date must be in the future');
						}
					},
				},
			},
			endDate: {
				type: DataTypes.DATE,
				allowNull: false,
				validate: {
					isDate: {
						msg: `endDate must be a valid date`,
					},
					isAfterStart(value) {
						const { startDate } = this;
						if (new Date(value) <= new Date(startDate)) {
							throw new Error(`endDate cannot be on or before startDate`);
						}

						// For Use to ensure end must be at least the following day,
						// rather than just in the future (ie, booking from 1am - 1pm invalid)

						// if (new Date(value).toDateString() === new Date(startDate).toDateString()) {
						// throw new Error('End date must be a different day than the start date');
						//   }
					},
				},
			},
		},
		{
			sequelize,
			modelName: 'Booking',
			...options,
		}
	);
	return Booking;
};
