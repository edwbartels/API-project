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

		const err = Error('Bad Request');
		err.errors = errors;
		err.status = 400;
		err.title = 'Bad Request';
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
	const errors = {};

	for (const key of Object.keys(req.query)) {
		if (key === 'page' || key === 'size')
			queryParams[key] = !isNaN(parseInt(req.query[key]))
				? parseInt(req.query[key])
				: 'invalid';
		if (
			key === 'maxLat' ||
			key === 'minLat' ||
			key === 'maxLng' ||
			key === 'minLng' ||
			key === 'minPrice' ||
			key === 'maxPrice'
		) {
			queryParams[key] = !isNaN(parseFloat(req.query[key]))
				? parseFloat(req.query[key])
				: 'invalid';
		}
	}
	if (!queryParams.page) queryParams.page = defaults.page;
	if (!queryParams.size) queryParams.size = defaults.size;
	// for (const [key, defaultValue] of Object.entries(defaults)) {
	// 	if (key === 'page' || key === 'size') {
	// 		queryParams[key] = !isNaN(parseInt(req.query[key]))
	// 			? parseInt(req.query[key])
	// 			: defaultValue;
	// 	} else
	// 		queryParams[key] = !isNaN(parseFloat(req.query[key]))
	// 			? parseFloat(req.query[key])
	// 			: defaultValue;
	// }
	if (queryParams.page < 1 || queryParams.page === 'invalid') {
		errors.page = 'Page must be greater than or equal to 1';
	}
	if (
		queryParams.size < 1 ||
		queryParams.size > 20 ||
		queryParams.size === 'invalid'
	)
		errors.size = 'Size must be between 1 and 20';
	if (queryParams.maxLat === 'invalid' || queryParams.maxLat < -90)
		errors.maxLat = 'Maximum latitude is invalid';
	if (queryParams.minLat === 'invalid' || queryParams.minLat > 90)
		errors.minLat = 'Minimum latitude is invalid';
	if (queryParams.maxLng === 'invalid' || queryParams.maxLng < -180)
		errors.maxLng = 'Maximum longitude is invalid';
	if (queryParams.minLng === 'invalid' || queryParams.minLng > 180)
		errors.minLng = 'Minimum longitude is invalid';
	if (queryParams.minPrice === ' invalid' || queryParams.minPrice <= 0)
		errors.minPrice = 'Minimum price must be greater than or equal to 0';
	if (queryParams.maxPrice === 'invalid' || queryParams.maxPrice <= 0)
		errors.maxPrice = 'Maximum price must be greater than or equal to 0';

	if (Object.keys(errors).length !== 0) {
		const err = new Error();
		err.message = 'Bad Request';
		err.errors = errors;
		err.status = 400;
		return next(err);
	}
	req.queryParams = queryParams;
	next();
};

module.exports = {
	handleValidationErrors,
	validateQueryParams,
};
