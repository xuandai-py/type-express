import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { NextFunction, Request, Response, RequestHandler } from 'express'
import HttpException from '../exceptions/HttpExceptions'

export default function validationMiddleware<T>(type: any, skipMissingProperties = false): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        validate(plainToInstance(type, req.body), { skipMissingProperties })
            .then((errors: ValidationError[]) => {
                if (errors.length > 0) {
                    const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(',')
                    next(new HttpException(400, message))
                } else {
                    next()
                }
            })
    }
}

