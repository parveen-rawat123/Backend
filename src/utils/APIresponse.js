class APIResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.succes = statusCode < 400
    }
}

export {APIResponse}