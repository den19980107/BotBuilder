
import mongoose from 'mongoose';

export default (DBConnectionString: string) => {

    const connect = () => {
        mongoose
            .connect(
                DBConnectionString,
                { useNewUrlParser: true }
            )
            .then(() => {
                return console.info(`Successfully connected to ${DBConnectionString}`);
            })
            .catch(error => {
                console.error('Error connecting to database: ', error);
                return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};