const express = require('express');
const router = express.Router();

const { Spot, User, Review, Booking, SpotImage } = require('../../db/models');
const { Op, fn, col } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const { ValidationError, UniqueConstraintError } = require('sequelize');

// GET all spots
router.get('/', async (req, res, next) => {
	let spots = [];
	spots = await Spot.findAll();
	spots.forEach((el) => {
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
	const spot = await Spot.findByPk(req.params.spotId, {
		include: [
			{
				model: Review,
				attributes: [
					[fn('COUNT', col('stars')), 'numReviews'],
					[fn('AVG', col('stars')), 'avgStarRating'],
				],
			},
			{
				model: SpotImage,
				attributes: ['id', 'url', 'preview'],
			},
			{
				model: User,
				attributes: ['id', 'firstName', 'lastName'],
			},
		],
	});
	if (spot) {
		res.status(200).json(spot);
	}
	// Error Handling for undefined spot
	else {
		return res.status(404).json({
			message: `Spot couldn't be found`,
		});
	}
});

// POST create a spot

router.post('/', requireAuth, async (req, res, next) => {
	const { user } = req;
	console.log(user);
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;
	try {
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
	} catch (error) {
		if (error instanceof ValidationError) {
			const errors = {};
			error.errors.forEach((err) => {
				errors[err.path] = err.message;
			});
			return res.status(400).json({
				message: 'Bad Request',
			});
		}

		console.error(error);
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// POST add image to spot by spotId

router.post('/:spotId/images', requireAuth, async (req, res, next) => {
	const { user } = req;
	console.log(user);
	const { url, preview } = req.body;
	try {
		const img = await SpotImage.create({
			spotId: req.params.spotId,
			url: url,
			preview: preview,
		});
		res.status(201).json(img);
	} catch (error) {
		if (error.name === 'SequelizeForeignKeyConstraintError') {
			return res.status(404).json({
				message: `Spot couldn't be found`,
			});
		}

		console.error(error);
		return res.status(500).json({
			message: 'Internal Server Error',
		});
	}
});

// PUT edit a spot

router.put('/:spotId', requireAuth, async (req, res, next) => {
	const { user } = req;
	console.log(user);
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;
	const spot = await Spot.findByPk(req.params.spotId);
	if (!spot)
		return res.status(404).json({
			message: `Spot couldn't be found`,
		});
	try {
		await spot.update({
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
		res.status(200).json(spot);
	} catch (error) {
		if (error instanceof ValidationError) {
			const errors = {};
			error.errors.forEach((err) => {
				errors[err.path] = err.message;
			});
			return res.status(400).json({
				message: 'Bad Request',
				errors,
			});
		}
		console.error(error);
		return res.status(500).json({ message: `Internal Server Error` });
	}
});

// DELETE a spot

router.delete('/:spotId', requireAuth, async (req, res, next) => {
	const { user } = req;
	console.log(user);
	const spot = await Spot.findByPk(req.params.spotId);
	if (!spot)
		return res.status(404).json({
			message: `Spot couldn't be found`,
		});
	await spot.destroy();
	res.status(200).json({
		message: 'Successfully deleted',
	});
});

// GET reviews by spotId

router.get('/:spotId/reviews', async (req, res, next) => {
	const reviews = await Review.findAll({
		where: {
			spotId: req.params.spotId,
		},
		include: [
			{
				model: 'Users',
				attributes: ['id', 'firstName', 'lastName'],
			},
			{
				model: 'ReviewImages',
				attributes: ['id', 'url'],
			},
		],
	});
	if (!reviews) {
		return res.status(404).json({
			message: `Spot couldn't be found`,
		});
	}
	res.status(200).json(reviews);
});

//POST create review by spotId
router.post('/:spotId/reviews', requireAuth, async (req, res, next) => {
	const { user } = req;
	const { review, stars } = req.body;
	const spot = await Spot.findByPk(req.params.spotId);

	if (!spot) {
		return res.status(404).json({
			message: `Spot couldn't be found`,
		});
	}

	try {
		const newReview = await Review.create({
			userId: user.id,
			spotId: req.params.spotId,
			review: review,
			stars: stars,
		});
		res.status(201).json(newReview);
	} catch (error) {
		console.error(error);
		if (error instanceof ValidationError) {
			const errors = {};
			error.errors.forEach((err) => {
				errors[err.path] = err.message;
			});
			return res.status(400).json({
				message: 'Bad Request',
				errors,
			});
		}
		if (error instanceof UniqueConstraintError) {
			return res.status(500).json({
				message: 'User already has a review for this spot',
			});
		}
		return res.status(500).json({
			message: 'Internal Server Error',
		});
	}
});

// GET all bookings by spotId

router.get('/:spotId/bookings', requireAuth, async (req, res, next) => {
	const { user } = req;
	const bookings = await Booking.findAll({
		where: {
			spotId: req.params.spotId,
		},
		attributes: ['spotId', 'startDate', 'endDate'],
	});
	res.status(200).json(bookings);
});

// POST create booking by spotId

router.post('/:spotId/bookings', requireAuth, async (req, res, next) => {
	const { user } = req;
	const { startDate, endDate } = req.body;
	const booking = await Booking.create({
		spotId: req.params.spotId,
		userId: user.id,
		startDate: startDate,
		endDate: endDate,
	});
	res.status(201).json(booking);
});
module.exports = router;
