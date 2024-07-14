import express from 'express';
import eventsRouter from './src/route/eventRoute';
const app = express();


app.use(express.json());
app.use('/event', eventsRouter)


const port = process.env.PORT || 5000;

const start = async () => {
    try {
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
}

start();