import express from 'express';
import AuthRoute from './routes/auth';

const app = express();

app.use(express.json());

// register routes
new AuthRoute(app);



app.listen(5000, () => {
    console.log(`app listening at http://localhost:5000`)
})