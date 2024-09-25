const express = require('express');
const router = express.Router();

const {
	Spot,
	Review,
	Booking,
	SpotImage,
	ReviewImage,
} = require('../../db/models');
const { Op, fn, col } = require('sequelize');
const { requireAuth } = require('../../utils/auth');

// DELETE a review image by imageId

router.delete('/:imageId', requireAuth, async (req, res, next) => {
	const { user } = req;
	const img = await ReviewImage.findByPk(req.params.imageId, {
		include: {
			model: Review,
			attributes: ['userId'],
		},
	});
	// if (!img) {
	// 	return res.status(404).json({
	// 		message: `Review Image couldn't be found`,
	// 	});
	// }
	if (!img) {
		const err = new Error(`Review Image couldn't be found`, { status: 404 });
		next(err);
	}
	if (img.Review.userId != user.id) {
		const err = new Error('Forbidden', { status: 403 });
		next(err);
	}
	await img.destroy();
	res.status(200).json({
		message: 'Successfully deleted',
	});
});

module.exports = router;
