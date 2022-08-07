
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
import ReportController from './users/report.controller';

validateEnv()
const app = new App(
  [
    new PostsController(),
    new AuthenticationController(),
    new ReportController()
  ],
);

app.listen();
