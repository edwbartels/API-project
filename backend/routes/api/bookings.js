const express = require('express');
const router = express.Router();

const { Spot, Review, Booking, SpotImage } = require('../../db/models');
const { Op, fn, col } = require('sequelize');
const { requireAuth } = require('../../utils/auth');

// GET bookings by current user

router.get('/current', requireAuth, async (req, res, next) => {
	const { user } = req;
	const bookings = await Booking.findAll({
		where: { ownerId: user.id },
	});
	res.status(200).json(bookings);
});

// PUT edit booking by bookingId

router.put('/:bookingId', requireAuth, async (req, res, next) => {
	const { user } = req;
	const { startDate, endDate } = req.body;
	const booking = await Booking.findByPk(req.params.bookingId);
	await booking.update({
		startDate: startDate,
		endDate: endDate,
	});
	res.status(200).json(booking);
});

// DELETE a booking by bookingId

router.delete('/:bookingId', requireAuth, async (req, res, next) => {
	const { user } = req;
	const booking = await Booking.findByPk(req.params.bookingId);
	await booking.destroy();
	res.status(200).json({
		message: 'Successfully deleted',
	});
});

module.exports = router;
