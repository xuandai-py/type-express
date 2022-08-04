import express from 'express';
import * as bodyParser from 'body-parser';
import Controller from './src/interfaces/controller.interface'
import mongoose from 'mongoose';
import errorMiddleware from './src/middleware/error.middleware';
import cookieParser from 'cookie-parser';

class App {
    public app: express.Application

    constructor(controllers: Controller[]) {
        this.app = express();

        this.connectToDatabase();
        this.initialzeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }


    public listen() {
        this.app.listen(process.env.PORT, () => {
          console.log(`App listening on the port ${process.env.PORT}`);
        });
      }
    
      public getServer() {
        return this.app;
      }

    private initialzeMiddlewares() {
        this.app.use(bodyParser.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(cookieParser()) // transform string into an object
        //this.app.use(cors)

    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
      }
    
      private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
          this.app.use('/', controller.router);
        });
      }

    private connectToDatabase() {
        const { MONGO_PATH, PORT } = process.env
        mongoose.connect(MONGO_PATH)
    }


}

export default App