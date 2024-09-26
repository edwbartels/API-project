'use strict';
const { Model } = require('sequelize');
let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = (sequelize, DataTypes) => {
	class Review extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Review.belongsTo(models.User, { foreignKey: 'userId' });
			Review.belongsTo(models.Spot, { foreignKey: 'spotId' });
			Review.hasMany(models.ReviewImage, { foreignKey: 'reviewId' });
		}
	}
	Review.init(
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			spotId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},

			review: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: `Review text is required`,
					},
				},
			},
			stars: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					max: {
						args: [5],
						msg: `Stars must be an integer from 1 to 5`,
					},
					min: {
						args: [1],
						msg: `Stars must be an integer from 1 to 5`,
					},
				},
			},
		},
		{
			sequelize,
			modelName: 'Review',
			...options,
			// indexes: [
			// 	{
			// 		unique: true,
			// 		fields: ['userId', 'spotId'],
			// 	},
			// ],
		}
	);
	return Review;
};
