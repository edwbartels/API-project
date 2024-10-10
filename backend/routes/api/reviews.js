const express = require('express');
const router = express.Router();

const {
	User,
	Spot,
	Review,
	Booking,
	ReviewImage,
	SpotImage,
} = require('../../db/models');
const { Op, fn, col } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');

router.get('/current', requireAuth, async (req, res, next) => {
	const { user } = req;

	const reviews = await Review.findAll({
		where: {
			userId: user.id,
		},
		include: [
			{
				model: User,
				attributes: ['id', 'firstName', 'lastName'],
			},
			{
				model: Spot,
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
				],
				include: {
					model: SpotImage,
					where: {
						preview: true,
					},
					required: false,
					attributes: ['url', 'preview'],
				},
			},
			{
				model: ReviewImage,
				attributes: ['id', 'url'],
			},
		],
	});
	if (!reviews.length) return res.status(200).json({ Reviews: reviews });
	const formattedReviews = reviews.map((review) => {
		return {
			id: review.id,
			spotId: review.spotId,
			userId: review.userId,
			review: review.review,
			stars: review.stars,
			createdAt: review.createdAt,
			updatedAt: review.updatedAt,
			User: review.User,
			Spot: {
				id: review.Spot.id,
				ownerId: review.Spot.ownerId,
				address: review.Spot.address,
				city: review.Spot.city,
				state: review.Spot.state,
				country: review.Spot.country,
				lat: review.Spot.lat,
				lng: review.Spot.lng,
				name: review.Spot.name,
				price: review.Spot.price,
				previewImage:
					review.Spot.SpotImages && review.Spot.SpotImages.length > 0
						? review.Spot.SpotImages[0].url
						: null,
			},
			ReviewImages: review.ReviewImages || review.ReviewImage,
		};
	});
	res.status(200).json({ Reviews: formattedReviews });
});

// POST add image to review by reviewId

router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
	const { user } = req;
	const { url } = req.body;
	const review = await Review.findByPk(req.params.reviewId, {
		include: {
			model: ReviewImage,
			attributes: ['id'],
		},
	});
	if (!review) {
		const err = new Error(`Review couldn't be found`);
		err.status = 404;
		return next(err);
	}
	if (review.userId != user.id) {
		const err = new Error('Forbidden');
		err.status = 403;
		return next(err);
	}
	if (review.ReviewImages.length >= 10) {
		const err = new Error(
			`Maximum number of images for this resource was reached`
		);
		err.status = 403;
		return next(err);
	}
	const img = await ReviewImage.create({
		reviewId: review.id,
		url: url,
	});
	const respo = {
		id: img.id,
		url: img.url,
	};
	res.status(201).json(respo);
});

// PUT edit a review by reviewId

router.put(
	'/:reviewId',
	requireAuth,
	handleValidationErrors,
	async (req, res, next) => {
		const { user } = req;
		const { review, stars } = req.body;
		const reviewInstance = await Review.findByPk(req.params.reviewId);

		if (!reviewInstance) {
			const err = new Error(`Review couldn't be found`);
			err.status = 404;
			return next(err);
		}

		if (reviewInstance.userId != user.id) {
			const err = new Error('Forbidden');
			err.status = 403;
			return next(err);
		}
		try {
			await reviewInstance.update({
				review: review ?? undefined,
				stars: stars ?? undefined,
			});
			res.status(200).json(reviewInstance);
		} catch (error) {
			next(error);
		}
	}
);

// DELETE a review by id

router.delete('/:reviewId', requireAuth, async (req, res, next) => {
	const { user } = req;
	const review = await Review.findByPk(req.params.reviewId);
	if (!review) {
		const err = new Error(`Review couldn't be found`);
		err.status = 404;
		return next(err);
	}
	if (review.userId !== user.id) {
		const err = new Error('Forbidden');
		err.status = 403;
		return next(err);
	}
	await review.destroy();
	res.status(200).json({
		message: 'Successfully deleted',
	});
});

module.exports = router;
