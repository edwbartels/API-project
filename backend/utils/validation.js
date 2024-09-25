const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
	const validationErrors = validationResult(req);

	if (!validationErrors.isEmpty()) {
		const errors = {};
		validationErrors
			.array()
			.forEach((error) => (errors[error.path] = error.msg));

		const err = Error('Bad request.');
		err.errors = errors;
		err.status = 400;
		err.title = 'Bad request.';
		next(err);
	}
	next();
};

const validateQueryParams = (req, res, next) => {
	const defaults = {
		page: 1,
		size: 20,
		minLat: undefined,
		maxLat: undefined,
		minLng: undefined,
		maxLng: undefined,
		minPrice: undefined,
		maxPrice: undefined,
	};
	const queryParams = {};

	for (const [key, defaultValue] of Object.entries(defaults)) {
		if (req.query[key] !== undefined) {
			if (key === 'page' || key === 'size') {
				queryParams[key] = parseInt(req.query[key]) ?? defaultValue;
			} else queryParams[key] = parseFloat(req.query[key]) ?? defaultValue;
		}
	}
	const errors = {};
	if (queryParams.page < 1) {
		errors.page = 'Page must be greater than or equal to 1';
	}
	if (queryParams.size < 1 || queryParams.size > 20)
		errors.size = 'Size must be between 1 and 20';
	if (queryParams.maxLat && queryParams.maxLat < -90)
		errors.maxLat = 'Maximum latitude is invalid';
	if (queryParams.minLat && queryParams.minLat > 90)
		errors.minLat = 'Minimum latitude is invalid';
	if (queryParams.maxLng && queryParams.maxLng < -180)
		errors.maxLng = 'Maximum longitude is invalid';
	if (queryParams.minLng && queryParams.minLng > 180)
		errors.minLng = 'Minimum longitude is invalid';
	if (queryParams.minPrice && queryParams.minPrice <= 0)
		errors.minPrice = 'Minimum price must be greater than or equal to 0';
	if (queryParams.maxPrice && queryParams.maxPrice <= 0)
		errors.maxPrice = 'Maximum price must be greater than or equal to 0';

	if (Object.keys(errors).length !== 0) {
		const err = new Error('Bad request');
		err.errors = errors;
		err.status = 400;
		next(err);
	}
	req.queryParams = queryParams;
	next();
};

module.exports = {
	handleValidationErrors,
	validateQueryParams,
};
