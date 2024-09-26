'use strict';
const { Booking } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = {
	async up(queryInterface, Sequelize) {
		await Booking.bulkCreate(
			[
				{
					spotId: 1,
					userId: 2, // User with id 2 made the booking
					startDate: '2021-11-19',
					endDate: '2021-11-20',
				},
			],
			options
		);
	},

	async down(queryInterface, Sequelize) {
		options.tableName = 'Bookings';
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(
			options,
			{
				startDate: { [Op.in]: ['2021-11-19'] },
			},
			{}
		);
	},
};
