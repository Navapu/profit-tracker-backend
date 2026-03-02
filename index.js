import express from 'express';
import { PORT, BACKEND_URL} from './config/config.js';
import { connectDB } from './db/mongoose.js';
import logger from "./config/logger.js";

const app = express();


// ---------------------------
// MIDDLEWARES / MIDDLEWARES
// ---------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.send("Profit Tracker API")
})

app.listen(PORT, () => {
    logger.info(`Server running at: ${BACKEND_URL}${PORT}`)
})