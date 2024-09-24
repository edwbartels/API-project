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

// POST add image to review by reviewId

router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
	const { user } = req;
	const { url } = req.body;
	const review = await Review.findByPk(req.params.reviewId, {
		include: {
			model: ReviewImage,
			attributes: [[fn('COUNT', col('url')), 'imageCount']],
		},
	});
	if (!review) {
		return res.status(404).json({
			message: `Review couldn't be found`,
		});
	}
	if (review.imageCount >= 10) {
		return res.status(403).json({
			message: 'Maximum number of iamges for this resource was reached',
		});
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

router.put('/:reviewId', requireAuth, async (req, res, next) => {
	const { user } = req;
	const { rev, stars } = req.body;
	const review = await Review.findByPk(req.params.reviewId);
	if (!review) {
		return res.status(404).json({
			message: `Review couldn't be found`,
		});
	}
	try {
		await review.update({
			review: rev,
			stars: stars,
		});
		res.status(200).json(review);
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
		return res.status(500).json({ message: 'Internal Server Error' });
	}
});

// DELETE a review by id

router.delete('/:reviewId', requireAuth, async (req, res, next) => {
	const { user } = req;
	const review = await Review.findByPk(req.params.reviewId);
	if (!review) {
		res.status(404).json({
			message: `Review couldn't be found`,
		});
	}
	await review.destroy;
	res.status(200).json({
		message: 'Successfully deleted',
	});
});

module.exports = router;
