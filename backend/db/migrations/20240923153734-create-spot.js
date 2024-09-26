'use strict';
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA; // define your schema in options object
}
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			'Spots',
			{
				id: {
					allowNull: false,
					autoIncrement: true,
					primaryKey: true,
					type: Sequelize.INTEGER,
				},
				ownerId: {
					allowNull: false,
					type: Sequelize.INTEGER,
					references: {
						// model: { tableName: 'Users', schema: process.env.SCHEMA },
						model: 'Users',
						key: 'id',
					},
					onDelete: 'CASCADE',
				},
				address: {
					allowNull: false,
					type: Sequelize.STRING,
					unique: true,
				},
				city: {
					allowNull: false,
					type: Sequelize.STRING,
				},
				state: {
					allowNull: false,
					type: Sequelize.STRING,
				},
				country: {
					allowNull: false,
					type: Sequelize.STRING,
				},
				lat: {
					allowNull: false,
					type: Sequelize.DECIMAL,
				},
				lng: {
					allowNull: false,
					type: Sequelize.DECIMAL,
				},
				name: {
					allowNull: false,
					type: Sequelize.STRING,
					unique: true,
				},
				description: {
					allowNull: false,
					type: Sequelize.STRING,
				},
				price: {
					allowNull: false,
					type: Sequelize.DECIMAL,
				},
				createdAt: {
					allowNull: false,
					type: Sequelize.DATE,
					defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				},
				updatedAt: {
					allowNull: false,
					type: Sequelize.DATE,
					defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				},
			},
			options
		);
	},
	async down(queryInterface, Sequelize) {
		options.tableName = 'Spots';
		// await Promise.all([
		// 	queryInterface.removeConstraint('Reviews', 'Reviews_spotId_fkey'),
		// 	queryInterface.removeConstraint('SpotImages', 'SpotImages_spotId_fkey'),
		// 	queryInterface.removeConstraint('Bookings', 'Bookings_spotIdId_fkey'),
		// ]);
		await queryInterface.dropTable(options);
	},
};
