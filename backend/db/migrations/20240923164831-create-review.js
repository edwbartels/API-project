'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Reviews', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			spotId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: 'Spots', key: 'id' },
				onDelete: 'Cascade',
			},
			userId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				refereneces: { model: 'Users', key: 'id' },
				onDelete: 'Cascade',
			},
			review: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			stars: {
				type: Sequelize.INTEGER,
				allowNull: false,
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
		});

		await queryInterface.addConstraint('Reviews', {
			fields: ['userId', 'spotId'],
			type: 'unique',
			name: 'unique_user_spot',
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Reviews');
	},
};
