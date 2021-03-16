import express from 'express';
import DBConfig from '../config/db.json';
import connectToDB from './connectToDB';
import cors from 'cors';
// Routes
import BotRoute from './routes/bot';
import AuthRoute from './routes/auth';

// Node Converter
import NodeConverter from './converter';

const app = express();
app.use(express.json());
app.use(cors());

const dbConnectionString = `mongodb://${DBConfig.HOST}:${DBConfig.PORT}/${DBConfig.DBNAME}`
connectToDB(dbConnectionString)

// register routes
new AuthRoute(app);
new BotRoute(app)


// node initail
NodeConverter(app);

app.listen(5000, () => {
    console.log(`app listening at http://localhost:5000`)
})