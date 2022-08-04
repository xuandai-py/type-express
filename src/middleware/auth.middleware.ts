import { NextFunction, Request, Response } from "express";
import UserRequest from '../interfaces/userRequest.interface'
import jwt from 'jsonwebtoken'
import {DataStoredInToken} from '../interfaces/TokenData'
import userModel from '../model/user.model'
import { OtherCaseExceptions, WrongAuthenticationException } from "../exceptions/CaseExceptions";

// Check the JWT token that user send > append user data to request object
async function authMiddleware(request: UserRequest, response: Response, next: NextFunction) {
    const cookies = request.cookies
    const secretKey = process.env.JWT_SECRET_KEY
    if (cookies && cookies.Authorization) {
        try {
            const verify = jwt.verify(cookies.Authorization, secretKey) as DataStoredInToken
            const user = await userModel.findById(verify._id)
            if (user) {
                request.user = user
                next()
            } else next(new WrongAuthenticationException())

        } catch (error) {
            console.error(`authMiddleware error: `, error);
            next(new WrongAuthenticationException())
        }
    } else {
        console.error(`Something wrong while authenticating`);
        next(new OtherCaseExceptions(401, `Missing or wrong authentication token`))
        
    }
}

export default authMiddleware