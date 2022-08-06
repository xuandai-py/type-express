import { NextFunction, Request, Response, Router} from 'express'
import postModel from "../model/posts.model";
import Controller from "../interfaces/controller.interface";
import { WrongAuthenticationException } from 'exceptions/CaseExceptions';
import authMiddleware from '../middleware/auth.middleware';
import UserRequest from '../interfaces/userRequest.interface';

class UserController implements Controller {

    public path = '/users'
    public router = Router()
    private post = postModel

    constructor() {
        this.initialzeRoutes()
    }

    private initialzeRoutes() {
        this.router.post(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsOfUSer)
    }

    private getAllPostsOfUSer = async (request: UserRequest, response: Response, next: NextFunction) => {
        const userID = request.params.id
        if (userID === request.user._id.toString()) {
            const posts = await this.post.find({author: userID})
            response.send(posts)
        }
    next(new WrongAuthenticationException())
    }
}

export default UserController