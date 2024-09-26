'use strict';
const { Model } = require('sequelize');
let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = (sequelize, DataTypes) => {
	class SpotImage extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			SpotImage.belongsTo(models.Spot, { foreignKey: 'spotId' });
		}
	}
	SpotImage.init(
		{
			spotId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			url: {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
			},
			preview: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'SpotImage',
			...options,
		}
	);
	return SpotImage;
};
