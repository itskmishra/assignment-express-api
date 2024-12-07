import { ApiError } from './api_error.js';
// making wrapper around the async handle and try/catch block
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            if (err instanceof ApiError) {
                res.status(err.statusCode).json(err.toResponse());
            } else {
                next(err)
            }
        })
    }
};

export { asyncHandler }
