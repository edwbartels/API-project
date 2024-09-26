'use strict';
const { SpotImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
	async up(queryInterface, Sequelize) {
		await SpotImage.bulkCreate(
			[
				{
					spotId: 1,
					url: 'https://example.com/spot1_image1.jpg',
					preview: true,
				},
				{
					spotId: 1,
					url: 'https://example.com/spot1_image2.jpg',
					preview: false,
				},
				{
					spotId: 2,
					url: 'https://example.com/spot2_image1.jpg',
					preview: true,
				},
				{
					spotId: 3,
					url: 'https://example.com/spot3_image1.jpg',
					preview: true,
				},
			],
			options
		);
	},

	async down(queryInterface, Sequelize) {
		options.tableName = 'SpotImages';
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(
			options,
			{
				url: {
					[Op.in]: [
						'https://example.com/spot1_image1.jpg',
						'https://example.com/spot1_image2.jpg',
						'https://example.com/spot2_image1.jpg',
						'https://example.com/spot3_image1.jpg',
					],
				},
			},
			{}
		);
	},
};
