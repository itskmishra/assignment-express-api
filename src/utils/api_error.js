class ApiError extends Error {
    constructor(statusCode, message="Something went wrong!", errors=[], stack=""){
        super(message)
        this.success = false;
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.errors = errors;

        // looking for stacktraces if yes then replacing it otherwise getting one
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    };
    toResponse() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
        };
    }

};

export { ApiError }
