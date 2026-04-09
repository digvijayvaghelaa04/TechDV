/**
 * Validation Middleware
 * Validates request body, query, or params against Joi schemas
 */

const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
            convert: true       // Convert types (e.g., string to number)
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors
            });
        }

        // Replace request data with sanitized/validated data
        req[property] = value;
        next();
    };
};

module.exports = validateRequest;
