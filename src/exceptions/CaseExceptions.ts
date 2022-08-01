import HttpException from "./HttpExceptions";

class PostNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Post id:${id} not found`)
    }
}

class UnexpectedException extends HttpException {
    constructor() {
        super(500, `Something went wrong, try later!!!`)
    }
}

class UserAlreadyExistsException extends HttpException {
    constructor(email: string) { 
        super(409, `User with email: ${email} is already existed`)
    }
}

class WrongCredentialException extends HttpException {
    constructor() {
        super(404, `Username or password is incorrect`)
    }
}

export {
    PostNotFoundException, UnexpectedException,
    UserAlreadyExistsException, WrongCredentialException
}