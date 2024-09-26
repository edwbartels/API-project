'use strict';
const { ReviewImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = {
	async up(queryInterface, Sequelize) {
		await ReviewImage.bulkCreate(
			[
				{
					reviewId: 1,
					url: 'https://example.com/review1_image1.jpg',
				},
				{
					reviewId: 1,
					url: 'https://example.com/review1_image2.jpg',
				},
				{
					reviewId: 2,
					url: 'https://example.com/review2_image1.jpg',
				},
				{
					reviewId: 3,
					url: 'https://example.com/review3_image1.jpg',
				},
			],
			options
		);
	},

	async down(queryInterface, Sequelize) {
		options.tableName = 'ReviewImages';
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(
			options,
			{
				url: {
					[Op.in]: [
						'https://example.com/review1_image1.jpg',
						'https://example.com/review1_image2.jpg',
						'https://example.com/review2_image1.jpg',
						'https://example.com/review3_image1.jpg',
					],
				},
			},
			{}
		);
	},
};
