const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
            resolve((error) => next(error))
    }

}

export { asyncHandler }


