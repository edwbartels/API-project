'use strict';
const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = {
	async up(queryInterface, Sequelize) {
		await Spot.bulkCreate(
			[
				{
					ownerId: 1,
					address: '123 Disney Lane',
					city: 'San Francisco',
					state: 'California',
					country: 'United States of America',
					lat: 37.7645358,
					lng: -122.4730327,
					name: 'App Academy',
					description: 'Place where web developers are created',
					price: 123,
					createdAt: new Date('2021-11-19 20:39:36'),
					updatedAt: new Date('2021-11-19 20:39:36'),
				},
				{
					ownerId: 2,
					address: '456 Ocean Drive',
					city: 'Los Angeles',
					state: 'California',
					country: 'United States of America',
					lat: 34.052235,
					lng: -118.243683,
					name: 'Beach House',
					description: 'A relaxing stay by the ocean',
					price: 150,
					createdAt: new Date('2021-12-01 14:20:00'),
					updatedAt: new Date('2021-12-01 14:20:00'),
				},
				{
					ownerId: 3,
					address: '789 Mountain Rd',
					city: 'Denver',
					state: 'Colorado',
					country: 'United States of America',
					lat: 39.739236,
					lng: -104.990251,
					name: 'Mountain Retreat',
					description: 'Getaway in the Rocky Mountains',
					price: 200,
					createdAt: new Date('2021-10-15 08:45:12'),
					updatedAt: new Date('2021-10-15 08:45:12'),
				},
				{
					ownerId: 1,
					address: '321 Elm Street',
					city: 'Chicago',
					state: 'Illinois',
					country: 'United States of America',
					lat: 41.878113,
					lng: -87.629799,
					name: 'City Loft',
					description: 'Stay in the heart of downtown Chicago',
					price: 175,
					createdAt: new Date('2021-11-25 18:30:00'),
					updatedAt: new Date('2021-11-25 18:30:00'),
				},
				{
					ownerId: 2,
					address: '654 Pine St',
					city: 'New York',
					state: 'New York',
					country: 'United States of America',
					lat: 40.712776,
					lng: -74.005974,
					name: 'NYC Apartment',
					description: 'Modern apartment in New York City',
					price: 250,
					createdAt: new Date('2021-11-05 12:00:00'),
					updatedAt: new Date('2021-11-05 12:00:00'),
				},
			],
			options
		);
	},

	async down(queryInterface, Sequelize) {
		options.tableName = 'Spots';
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(
			options,
			{
				name: { [Op.in]: ['App Academy'] },
			},
			{}
		);
	},
};
