import express from 'express';
import DBConfig from '../config/db.json';
import connectToDB from './connectToDB';
import cors from 'cors';
// Routes
import BotRoute from './routes/bot';
import AuthRoute from './routes/auth';
import UserRoute from './routes/user';
// Node Converter
import NodeConverter from './converter';

const app = express();
app.use(express.json());
app.use(cors());

const dbConnectionString = `mongodb://${DBConfig.HOST}:${DBConfig.PORT}/${DBConfig.DBNAME}`
try {
    connectToDB(dbConnectionString)
} catch (e) {
    console.error("connecting to database have some error", e)
}
// register routes
new AuthRoute(app);
new BotRoute(app);
new UserRoute(app);

// NodeConverter start
NodeConverter.start();

app.listen(5000, () => {
    console.log(`app listening at http://localhost:5000`)
})


export { app }