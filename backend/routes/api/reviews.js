const express = require('express');
const router = express.Router();

const { Spot, Review, Booking, ReviewImage } = require('../../db/models');
const { Op, fn, col } = require('sequelize');
const { requireAuth } = require('../../utils/auth');

router.get('/current', requireAuth, async (req, res, next) => {
	const { user } = req;
	const reviews = await Review.findAll({
		where: {
			userId: user.id,
		},
		include: [
			{
				model: 'Users',
				attributes: ['id', 'firstName', 'lastName'],
			},
			{
				model: 'Spots',
				attributes: [
					'id',
					'ownerId',
					'address',
					'city',
					'state',
					'country',
					'lat',
					'lng',
					'name',
					'price',
					'previewImage',
				],
			},
			{
				model: 'ReviewImages',
				attributes: ['id', 'url'],
			},
		],
	});
	res.status(200).json(reviews);
});
module.exports = router;
