import express from 'express';
import DBConfig from '../config/db.json';
import connectToDB from './connectToDB';
import cors from 'cors';
// Routes
import AuthRoute from './routes/auth';

const app = express();
app.use(express.json());
app.use(cors());

const dbConnectionString = `mongodb://${DBConfig.HOST}:${DBConfig.PORT}/${DBConfig.DBNAME}`
connectToDB(dbConnectionString)

// register routes
new AuthRoute(app);

app.listen(5000, () => {
    console.log(`app listening at http://localhost:5000`)
})