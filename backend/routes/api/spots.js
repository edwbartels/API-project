const express = require('express');
const { Op } = require('sequelize');
const { Spot } = require('../../db/models');
const router = express.Router();

router.get('/', async (req, res, next) => {
	const spots = await Spot.findAll({});
	return res.status(200).json(spots);
});
