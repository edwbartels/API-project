const express = require('express');
const router = express.Router();

const { Spot, Review, Booking, SpotImage } = require('../../db/models');
const { Op, fn, col } = require('sequelize');
const { requireAuth } = require('../../utils/auth');

// GET all spots
router.get('/', async (req, res, next) => {
	let spots = [];
	let avgRating;
	spots = await Spot.findAll({
		// include: [
		// 	{
		// 		model: Review,
		// 		attributes: ['stars'],
		// 		// through: {
		// 		// 	attributes: [],
		// 		// },
		// 	},
		// 	{
		// 		model: SpotImage,
		// 		attributes: ['url', 'preview'],
		// 		// where: {
		// 		// 	preview: true,
		// 		// },
		// 	},
		// ],
	});
	spots.forEach((el) => {
		// if (el.Reviews.length) {
		// 	let avg = el.Reviews.reduce((acc, cur) => acc + cur) / el.Reviews.length;
		// 	el.avgRating = sum;
		// }
		const { avg } = Review.findOne({
			where: {
				spotId: el.id,
			},
			attributes: [[fn('AVG', col('stars')), 'avgRating']],
			raw: true,
		});
		el.avgRating = avg ? parseFloat(avg) : 0;
		const { imgUrl } = SpotImage.findOne({
			where: {
				spotId: el.id,
				preview: true,
			},
			attributes: ['url'],
			raw: true,
		});
		el.previewImage = imgUrl ?? null;
	});

	res.json(spots);
});

// GET all spots owned by current user

router.get('/current', requireAuth, async (req, res, next) => {
	const { user } = req;
	const spots = await Spot.findAll({
		where: { ownerId: user.id },
	});

	res.status(200).json(spots);
});

// GET spot by id

router.get('/:spotId', async (req, res, next) => {
	const spot = await Spot.findByPk(req.params.spotId);
	const { count, avg } = await Review.findAndCountAll({
		where: {
			spotId: spot.id,
		},
		attributes: [[fn('AVG', col('stars')), 'avgRating']],
	});
	spot.numReviews = count;
	spot.avgStarRating = avg ? parseFloat(avg) : 0;
	spot.SpotImages = SpotImage.findAll({
		where: {
			spotId: spot.id,
		},
		attributes: ['id', 'url', 'preview'],
	});
	res.status(200).json(spot);
});

router.post('/', requireAuth, async (req, res, next) => {
	const { user } = req;
	console.log(user);
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;
	const spot = await Spot.create({
		ownerId: user.id,
		address: address,
		city: city,
		state: state,
		country: country,
		lat: lat,
		lng: lng,
		name: name,
		description: description,
		price: price,
	});
	res.status(201).json(spot);
});

module.exports = router;
