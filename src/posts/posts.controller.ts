import * as express from 'express'
import postModel from '../model/posts.model'
import Post from './post.interface'
import Controller from '../interfaces/controller.interface'
import { PostNotFoundException, UnexpectedException } from '../exceptions/CaseExceptions';
import validationMiddleware from '../middleware/validation.middleware';
import CreatePostDto from './post.dto';
import authMiddleware from '../middleware/auth.middleware';
import UserRequest from 'interfaces/userRequest.interface';


class PostsController implements Controller {
    public path = '/posts';
    public router = express.Router();
    private post = postModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.getAllPosts);
        this.router
            .all(`${this.path}/*`, authMiddleware)
            .get(`${this.path}/:id`, this.getPostById)
            .patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost)
            .delete(`${this.path}/:id`, this.deletePost)
            .post(this.path, validationMiddleware(CreatePostDto), this.createPost)
    }

    private getAllPosts = (request: express.Request, response: express.Response) => {
        this.post.find()
            .then((posts) => {
                response.send(posts);
            });
    }

    private getPostById = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        try {
            const post = await this.post.findById(id)
            response.send(post)
        } catch (error) {
            next(new PostNotFoundException(id))
        }

    }

    private modifyPost = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        const postData: Post = request.body;
        this.post.findByIdAndUpdate(id, postData, { new: true })
            .then((post) => {
                if (post) {
                    response.send(post);
                } else {
                    next(new PostNotFoundException(id))
                }
            });
    }

    private createPost = (request: UserRequest, response: express.Response, next: express.NextFunction) => {
        const postData: Post = request.body;
        const createdPost = new this.post({
            ...postData,
            authorId: request.user._id
        });
        createdPost.save()
            .then((savedPost) => {
                if (savedPost) {
                    response.send(savedPost);
                } else {
                    next(new UnexpectedException())
                }
            });
    }

    private deletePost = (request: express.Request, response: express.Response) => {
        const id = request.params.id;
        this.post.findByIdAndDelete(id)
            .then((successResponse) => {
                if (successResponse) {
                    response.send(200);
                } else {
                    response.send(404);
                }
            });
    }
}

export default PostsController;