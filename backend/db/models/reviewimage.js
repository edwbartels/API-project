'use strict';
const { Model } = require('sequelize');
let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = (sequelize, DataTypes) => {
	class ReviewImage extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			ReviewImage.belongsTo(models.Review, { foreignKey: 'reviewId' });
		}
	}
	ReviewImage.init(
		{
			reviewId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			url: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'ReviewImage',
			...options,
		}
	);
	return ReviewImage;
};
