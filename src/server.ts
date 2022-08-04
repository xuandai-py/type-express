
// const app = express()
// app.listen(5000)
// app.use(loggerMiddleware)
// app.use(bodyParser.json())

// app.get('/hello', (req: express.Request, res: express.Response) => {
//     res.send('Helloword')
// })

// app.post('/', (req: express.Request, res: express.Response) => {
//     res.send(req.body)
// })

import App from '../app';
import PostsController from './posts/posts.controller';
import 'dotenv/config'
import validateEnv from './utils/validateEnv'
import AuthenticationController from './authentication/authentication.controller';

validateEnv()
const app = new App(
    [
    new PostsController(),
      new AuthenticationController()
    ],
  );
   
  app.listen();
