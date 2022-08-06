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
import jwt from 'jsonwebtoken'
import authMiddleware from "../middleware/auth.middleware";
import { UnexpectedException } from '../exceptions/CaseExceptions'
import { uid } from 'rand-token'

class AuthenticationController implements Controller {

    public path = '/auth'
    public router = Router()
    private userModel = userModel
    constructor() {
        this.initialzeRoutes()
    }

    private initialzeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration)
        this.router.post(`${this.path}/logout`, this.loggingOut)
        this.router.get(`${this.path}/test`, this.checkAuth)

        this.router.all(`${this.path}/`, authMiddleware)
            .post(`${this.path}/login`, validationMiddleware(LoginDto), this.loggingIn)
            .post(`${this.path}/changePassword`, validationMiddleware(LoginDto), this.changePassword)
        //this.router.post(`${this.path}/refreshToken`, this.refreshToken)
    }

    public checkAuth = (request: Request, response: Response, next: NextFunction) => {
        response.send('Working')
    }

    private registration = async (request: Request, res: Response, next: NextFunction) => {
        const userData: CreateUserDto = request.body
        const isUserExisted = await this.userModel.findOne({ email: userData.email })
        if (isUserExisted) {
            console.log('User existed');
         next(new UserAlreadyExistsException(userData.email))
        }
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10)
            const createUser = await this.userModel.create({
                ...userData,
                password: hashedPassword
            })
            createUser.password = undefined
            // gen Token
            const token = this.createToken(createUser)
            res.setHeader('Set-Cookie', [this.createCookie(token)])
            res.status(201).send(createUser)

        } catch (error) {
            console.error(error);
            next(new UnexpectedException())
        }

    }

    private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
        const userLoggedInData: LoginDto = request.body

        try {
            const user = await this.userModel.findOne({ email: userLoggedInData.email })
            if (!user) next(new WrongCredentialException())
            const compareHashedPassword = await bcrypt.compare(userLoggedInData.password, user.password)
            if (!compareHashedPassword) next(new WrongCredentialException())
            user.password = undefined
            const token = this.createToken(user)
            response.setHeader('Set-Cookie', [this.createCookie(token)])
            response.status(200).send(user)
        } catch (unexpectedEx) {
            console.error(unexpectedEx);
            next(new UnexpectedException())
        }

    }

    //
    private changePassword = async (request: Request, response: Response, next: NextFunction) => {
        // email, currentPassword, newPassword
        const { email, password, newPassword } = request.body

        const currentUserDB = await this.userModel.findOne({ email: email })
        const compareHashedPassword = await bcrypt.compare(password, currentUserDB.password)

        if (!currentUserDB || !compareHashedPassword) return next(new WrongCredentialException())
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            await currentUserDB.updateOne({ password: hashedPassword })
            response.sendStatus(200)
        } catch (error) {
            console.error(error);
            next(new UnexpectedException())
        }


    }

    private loggingOut = async (request: Request, response: Response, next: NextFunction) => {
        response.setHeader('Set-Cookie', ['Authorization=;Max-age=0'])
        response.sendStatus(200)
    }

    private createToken(user: User): TokenData {
        const secretKey = process.env.JWT_SECRET_KEY
        const expiresIn = 60 * 60 // 1h
        // auto refresh token at last minute while user still logging

        const data: DataStoredInToken = {
            _id: user._id,
            userEmail: user.email
        }

        return {
            expiresIn, token: jwt.sign(data, secretKey, { expiresIn }), refreshToken: uid(256)
        }
    }


    private createCookie(token: TokenData) {
        return `Authorization=${token.token}; HttpOnly; Max-age=${token.expiresIn}`
    }

}

export default AuthenticationController