const express = require('express');
const router = express.Router();

const { Spot, Review, Booking, SpotImage } = require('../../db/models');
const { Op } = require('sequelize');

router.get('/', async (req, res, next) => {
	let spots = [];
	let avgRating;
	spots = await Spot.findAll({
		include: [
			{
				model: Review,
				attributes: ['stars'],
				// through: {
				// 	attributes: [],
				// },
			},
			{
				model: SpotImage,
				attributes: ['url', 'preview'],
				// where: {
				// 	preview: true,
				// },
			},
		],
	});
	spots.forEach((el) => {
		if (el.Reviews.length) {
			let sum = el.Reviews.reduce((acc, cur) => acc + cur) / el.Reviews.length;
			el.avgRating = sum;
		}
		if (el.SpotImages.length) {
			el.previewImage = SpotImages.findOne({
				where: {
					spotId: el.id,
					preview: true,
				},
			}).url;
		}
	});

	res.json(spots);
});

module.exports = router;
