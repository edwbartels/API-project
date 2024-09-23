const express = require('express');
const router = express.Router();

const { Spot, Review, Booking, SpotImage } = require('../../db/models');
const { Op, fn, col } = require('sequelize');
const { requireAuth } = require('../../utils/auth');

// DELETE spot image by imageId

router.delete('/:imageId', requireAuth, async (req, res, next) => {
	const { user } = req;
	const img = await SpotImage.findByPk(req.params.imageId);
	await img.destroy();
	res.status(200).json({
		message: 'Successfully deleted',
	});
});

module.exports = router;
