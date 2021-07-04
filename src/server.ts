import express from 'express';
import DBConfig from '../config/db.json';
import connectToDB from './connectToDB';
import cors from 'cors';
// Routes
import ScriptRoute from './routes/script';
import AuthRoute from './routes/auth';
import UserRoute from './routes/user';
// Node Converter
import NodeConverter from './converter';
import DatabaseRoute from './routes/database';

const app = express();
// 設定 request body 最大為 1MB
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: 1024 * 2014 }));
app.use(cors());

const dbConnectionString = `mongodb://${DBConfig.HOST}:${DBConfig.PORT}/${DBConfig.DBNAME}`
try {
    connectToDB(dbConnectionString)
} catch (e) {
    console.error("connecting to database have some error", e)
}
// register routes
new AuthRoute(app);
new ScriptRoute(app);
new UserRoute(app);
new DatabaseRoute(app)

// NodeConverter start
NodeConverter.start();

app.listen(5000, () => {
    console.log(`app listening at http://localhost:5000`)
})


export { app }