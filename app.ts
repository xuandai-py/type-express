import express from 'express';
import * as bodyParser from 'body-parser';
import Controller from './src/interfaces/controller.interface'
import mongoose from 'mongoose';
import errorMiddleware from './src/middleware/error.middleware';

class App {
    public app: express.Application

    constructor(controllers: Controller[]) {
        this.app = express()
        this.connectToDatabase();

        this.initialzeMiddlewares()
        this.initialzeControllers(controllers)
        this.initialzeErrorHandling()
    }


    private initialzeMiddlewares() {
        this.app.use(bodyParser.json())
        this.app.use(express.urlencoded({extended: true}))
        //this.app.use(cors)

    }

    private initialzeErrorHandling() {
        this.app.use(errorMiddleware)
    }
    private initialzeControllers(controllers: Controller[]) {
        controllers.forEach(controller => {
            this.app.use('/', controller.router)
        });
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on port: ${process.env.PORT}`);
            
        })
    }

    private connectToDatabase() {
        const { MONGO_PATH, PORT } = process.env
        mongoose.connect(MONGO_PATH)
    }


}

export default App