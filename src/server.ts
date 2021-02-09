import express from 'express';
import AuthRoute from './routes/auth';
import DBConfig from '../config/db.json';
import connectToDB from './connectToDB';

const app = express();
app.use(express.json());

const dbConnectionString = `mongodb://${DBConfig.HOST}:${DBConfig.PORT}/${DBConfig.DBNAME}`
connectToDB(dbConnectionString)

// register routes
new AuthRoute(app);

app.listen(5000, () => {
    console.log(`app listening at http://localhost:5000`)
})