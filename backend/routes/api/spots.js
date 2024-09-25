const express = require('express');
const router = express.Router();

const { Spot, User, Review, Booking, SpotImage } = require('../../db/models');
const {
	Op,
	fn,
	col,
	ValidationError,
	UniqueConstraintError,
} = require('sequelize');
const { requireAuth } = require('../../utils/auth');

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
		attributes: [],
	});

	if (!spot) {
		const err = new Error(`Spot couldn't be found`, { status: 404 });
		next(err);
	}
	res.status(200).json(spot);
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
		next(error);
	}
});

// POST add image to spot by spotId

router.post('/:spotId/images', requireAuth, async (req, res, next) => {
	const { user } = req;
	console.log(user);
	const spot = await Spot.findByPk(req.params.spotId);
	if (!spot) {
		const err = new Error(`Spot couldn't be found`, { status: 404 });
		next(err);
	}
	if (spot.ownerId != user.id) {
		const err = new Error('Forbidden', { status: 403 });
		next(err);
	}
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
			// return res.status(404).json({
			// 	message: `Spot couldn't be found`,
			// });
			error.status = 404;
			error.message = `Spot couldn't be found`;
		}
		next(error);
	}
});

// PUT edit a spot

router.put('/:spotId', requireAuth, async (req, res, next) => {
	const { user } = req;
	console.log(user);
	const { address, city, state, country, lat, lng, name, description, price } =
		req.body;
	const spot = await Spot.findByPk(req.params.spotId);

	if (!spot) {
		const err = new Error(`Spot couldn't be found`, { status: 404 });
		next(err);
	}
	if (spot.ownerId != user.id) {
		const err = new Error('Forbidden', { status: 403 });
		next(err);
	}
	try {
		await spot.update({
			address: address ?? undefined,
			city: city ?? undefined,
			state: state ?? undefined,
			country: country ?? undefined,
			lat: lat ?? undefined,
			lng: lng ?? undefined,
			name: name ?? undefined,
			description: description ?? undefined,
			price: price ?? undefined,
		});
		res.status(200).json(spot);
	} catch (error) {
		next(error);
		// if (error instanceof ValidationError) {
		// 	const errors = {};
		// 	error.errors.forEach((err) => {
		// 		errors[err.path] = err.message;
		// 	});
		// 	return res.status(400).json({
		// 		message: 'Bad Request',
		// 		errors,
		// 	});
		// }
	}
});

// DELETE a spot

router.delete('/:spotId', requireAuth, async (req, res, next) => {
	const { user } = req;
	console.log(user);
	const spot = await Spot.findByPk(req.params.spotId);
	// if (!spot)
	// 	return res.status(404).json({
	// 		message: `Spot couldn't be found`,
	// 	});
	if (!spot) {
		const err = new Error(`Spot couldn't be found`, { status: 404 });
		next(err);
	}
	if (spot.ownerId != user.id) {
		const err = new Error('Forbidden', { status: 403 });
		next(err);
	}
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
	// if (!reviews) {
	// 	return res.status(404).json({
	// 		message: `Spot couldn't be found`,
	// 	});
	// }
	if (!reviews) {
		const err = new Error(`Spot couldn't be found`, { status: 404 });
		next(err);
	}
	res.status(200).json(reviews);
});

//POST create review by spotId

router.post('/:spotId/reviews', requireAuth, async (req, res, next) => {
	const { user } = req;
	const { review, stars } = req.body;
	const spot = await Spot.findByPk(req.params.spotId);

	// if (!spot) {
	// 	return res.status(404).json({
	// 		message: `Spot couldn't be found`,
	// 	});
	// }
	if (!spot) {
		const err = new Error(`Spot couldn't be found`, { status: 404 });
		next(err);
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
		// if (error instanceof ValidationError) {
		// 	const errors = {};
		// 	error.errors.forEach((err) => {
		// 		errors[err.path] = err.message;
		// 	});
		// 	return res.status(400).json({
		// 		message: 'Bad Request',
		// 		errors,
		// 	});
		// }
		if (error instanceof UniqueConstraintError) {
			// return res.status(500).json({
			// 	message: 'User already has a review for this spot',
			// });
			error.status = 500;
			error.message = `User already has a review for this spot`;
		}
		next(error);
	}
});

// GET all bookings by spotId

router.get('/:spotId/bookings', requireAuth, async (req, res, next) => {
	const { user } = req;
	const spot = await Spot.findByPk(req.params.spotId);
	if (!spot) {
		const err = new Error(`Spot couldn't be found`, { status: 404 });
		next(err);
	}
	try {
		let bookings;
		if (spot.ownerId === user.id) {
			bookings = await Booking.findAll({
				where: {
					spotId: spot.id,
				},
				include: {
					model: User,
					attributes: ['id', 'firstName', 'lastName'],
				},
			});
		} else {
			bookings = await Booking.findAll({
				where: {
					spotId: spot.id,
				},
				attributes: ['spotId', 'startDate', 'endDate'],
			});
		}
		res.status(200).json(bookings);
	} catch (error) {
		next(error);
	}
});

// POST create booking by spotId

router.post('/:spotId/bookings', requireAuth, async (req, res, next) => {
	const { user } = req;
	const { startDate, endDate } = req.body;
	const spot = await Spot.findByPk(re.params.spotId);
	if (!spot) {
		const err = new Error(`Spot couldn't be found`, { status: 404 });
		return next(err);
	}
	if (spot.ownerId === user.id) {
		const err = new Error('Forbidden', { status: 403 });
		return next(err);
	}
	const errors = {};
	const conflict = await Booking.findAll({
		where: {
			spotId: spot.id,
			[Op.or]: [
				{
					startDate: {
						[Op.lt]: endDate,
					},
					endDate: {
						[Op.gt]: startDate,
					},
				},
			],
		},
	});

	for (const booking of conflict) {
		if (startDate >= booking.startDate && startDate <= booking.endDate) {
			errors.startDate = 'Start date conflicts with an existing booking';
		}
		if (endDate >= booking.startDate && endDate <= booking.endDate) {
			errors.endDate = 'End date conflicts with an existing booking';
		}
	}
	if (Object.keys(errors).length > 0) {
		const err = new Error(
			'Sorry, this spot is already booked for the specified dates'
		);
		err.status = 403;
		err.errors = errors;
		return next(err);
	}

	try {
		const booking = await Booking.create({
			spotId: req.params.spotId,
			userId: user.id,
			startDate: startDate,
			endDate: endDate,
		});
		res.status(201).json(booking);
	} catch (error) {
		next(error);
	}
});
module.exports = router;
