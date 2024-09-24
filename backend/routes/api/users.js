const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const validateSignup = [
	check('email')
		.exists({ checkFalsy: true })
		.isEmail()
		.withMessage('Please provide a valid email.'),
	check('username')
		.exists({ checkFalsy: true })
		.isLength({ min: 4 })
		.withMessage('Please provide a username with at least 4 characters.'),
	check('username').not().isEmail().withMessage('Username cannot be an email.'),
	check('password')
		.exists({ checkFalsy: true })
		.isLength({ min: 6 })
		.withMessage('Password must be 6 characters or more.'),
	handleValidationErrors,
];

// Sign up
router.post('/', validateSignup, async (req, res) => {
	const { email, password, username, firstName, lastName } = req.body;
	const hashedPassword = bcrypt.hashSync(password);
	try {
		const user = await User.create({
			email,
			username,
			hashedPassword,
			firstName,
			lastName,
		});

		const safeUser = {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			username: user.username,
		};

		await setTokenCookie(res, safeUser);

		return res.status(201).json({
			user: safeUser,
		});
	} catch (error) {
		// Status 500, User already exists
		if (error instanceof UniqueConstraintError) {
			const errors = {};
			error.errors.forEach((err) => {
				errors[err.path] = `User with that ${err.path} already exists`;
			});

			return res.status(500).json({
				message: `User already exists`,
				errors,
			});
		} else if (error instanceof ValidationError) {
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

module.exports = router;
