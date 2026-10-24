const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    let statusCode = Number(error.statusCode || error.status) || 500;
    let message = error.message || "Internal server error";

    if (error.code === 11000) {
        statusCode = 409;
        message = "A record with that value already exists";
    } else if (error.name === "ValidationError" || error.name === "CastError") {
        statusCode = 400;
        message = error.message;
    } else if (error.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Invalid JSON request body";
    } else if (error.name === "MulterError") {
        statusCode = 400;
        message = error.message;
    } else if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Unauthorized";
    } else if (statusCode >= 500) {
        message = "Internal server error";
    }

    if (statusCode < 400 || statusCode > 599) {
        statusCode = 500;
        message = "Internal server error";
    }

    if (statusCode >= 500) {
        console.error("Request error:", error);
    }

    return res.status(statusCode).json({
        success: false,
        error: message
    });
};

export default errorHandler;
