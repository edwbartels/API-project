'use strict';
const { Review } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
	async up(queryInterface, Sequelize) {
		await Review.bulkCreate(
			[
				{
					userId: 1,
					spotId: 1,
					review: 'This was an awesome spot!',
					stars: 5,
					createdAt: new Date('2021-11-19 20:39:36'),
					updatedAt: new Date('2021-11-19 20:39:36'),
				},
				{
					userId: 2,
					spotId: 1,
					review: 'Great experience, loved it!',
					stars: 4,
					createdAt: new Date('2021-12-01 15:00:00'),
					updatedAt: new Date('2021-12-01 15:00:00'),
				},
				{
					userId: 1,
					spotId: 2,
					review: 'Decent stay but could be better.',
					stars: 3,
					createdAt: new Date('2021-11-15 14:30:00'),
					updatedAt: new Date('2021-11-15 14:30:00'),
				},
				{
					userId: 3,
					spotId: 3,
					review: 'Amazing place, highly recommended!',
					stars: 5,
					createdAt: new Date('2021-10-22 10:15:00'),
					updatedAt: new Date('2021-10-22 10:15:00'),
				},
				{
					userId: 2,
					spotId: 3,
					review: "The best vacation I've ever had.",
					stars: 5,
					createdAt: new Date('2021-12-05 12:45:00'),
					updatedAt: new Date('2021-12-05 12:45:00'),
				},
			],
			options
		);
	},

	async down(queryInterface, Sequelize) {
		options.tableName = 'Reviews';
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(
			options,
			{
				review: {
					[Op.in]: [
						'This was an awesome spot!',
						'Great experience, loved it!',
						'Decent stay but could be better.',
						'Amazing place, highly recommended!',
						"The best vacation I've ever had.",
					],
				},
			},
			{}
		);
	},
};
