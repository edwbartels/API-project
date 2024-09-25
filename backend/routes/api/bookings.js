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
		include: { model: Spot },
	});
	res.status(200).json(bookings);
});

// PUT edit booking by bookingId

router.put('/:bookingId', requireAuth, async (req, res, next) => {
	const { user } = req;
	const { startDate, endDate } = req.body;
	const booking = await Booking.findByPk(req.params.bookingId);
	if (!booking) {
		const err = new Error(`Booking couldn't be found`, { status: 404 });
		return next(err);
	}
	if (booking.userId != user.id) {
		const err = new Error('Forbidden', { status: 403 });
		return next(err);
	}
	try {
		await booking.update({
			startDate: startDate,
			endDate: endDate,
		});
		res.status(200).json(booking);
	} catch (error) {
		next(error);
	}
});

// DELETE a booking by bookingId

router.delete('/:bookingId', requireAuth, async (req, res, next) => {
	const { user } = req;
	const booking = await Booking.findByPk(req.params.bookingId, {
		include: [
			{
				model: Spot,
				attributes: ['ownerId'],
			},
		],
	});

	if (!booking) {
		const err = new Error(`Booking couldn't be found`, { status: 404 });
		return next(err);
	}
	if (booking.userId != user.id && booking.Spot.ownerId != user.id) {
		const err = new Error('Forbidden', { status: 403 });
		return next(err);
	}
	if (new Date(booking.startDate).getTime() < Date.now()) {
		const err = new Error(`Bookings that have been started can't be deleted`, {
			status: 403,
		});
		return next(err);
	}
	await booking.destroy();
	res.status(200).json({
		message: 'Successfully deleted',
	});
});

module.exports = router;
