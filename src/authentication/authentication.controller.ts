import { UserAlreadyExistsException, WrongCredentialException } from "../exceptions/CaseExceptions";
import { NextFunction, Request, Response, Router } from "express";
import Controller from "../interfaces/controller.interface";
import userModel from "../model/user.model";
import CreateUserDto from "../users/user.dto";
import bcrypt from "bcrypt"
import validationMiddleware from "../middleware/validation.middleware";
import LoginDto from "./Login.dto";
import User from '../users/user.interface'
import { DataStoredInToken, TokenData } from "../interfaces/TokenData";
import jwt from 'jwt'

class AuthenticationController implements Controller {

    public path = '/auth'
    public router = Router()
    private userModel = userModel
    constructor() {
        this.initialzeRoutes()
    }

    private initialzeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration)
        this.router.post(`${this.path}/login`, validationMiddleware(LoginDto), this.loggingIn)
    }

    private registration = async (requset: Request, response: Response, next: NextFunction) => {
        const userData: CreateUserDto = requset.body
        const isUserExisted = await this.userModel.findOne({ email: userData.email })
        if (isUserExisted) {
            next(new UserAlreadyExistsException(userData.email))
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10)
            const createUser = await this.userModel.create({
                ...userData,
                password: hashedPassword
            })
            createUser.password = undefined
            // gen Token
            const token = this.createToken(createUser)
            response.setHeader('Set-Cookie',  [this.createCookie(token)])
            response.status(201).send(createUser)

        }
    }

    private loggingIn = async (requset: Request, response: Response, next: NextFunction) => {
        const userLogInData: LoginDto = requset.body
        const user = await this.userModel.findOne({ email: userLogInData.email })
        if (user) {
            const compareHashedPassword = await bcrypt.compare(userLogInData.password, user.password)
            if (compareHashedPassword) {
                user.password = undefined
                const token = this.createToken(user)
                response.setHeader('Set-Cookie', [this.createCookie(token)])
                response.status(200).send(user)
            } else {
                next(new WrongCredentialException())
            }
        } else {
            next(new WrongCredentialException())
        }
    }

    private createToken(user: User): TokenData{
        const secretKey = process.env.JWT_SECRET_KEY
        const expiresIn = 60 * 60
        const data: DataStoredInToken = {
            _id: user._id,
            userEmail: user.email
        }
        
        return {
            expiresIn, token: jwt.sign(data, secretKey, {expiresIn})
        }
    }

    private createCookie(token: TokenData) {
        return `Authorization=${token.token}; HttpOnly; Max-age=${token.expiresIn}`
    }

}

export default AuthenticationController