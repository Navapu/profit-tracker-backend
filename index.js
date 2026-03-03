import express from 'express';
import { PORT, BACKEND_URL} from './config/config.js';
import { connectDB } from './db/mongoose.js';
import logger from "./config/logger.js";
import healthRoutes from "./routes/health.routes.js";
import { notFoundHandler, errorMiddleware } from './middlewares/error.middleware.js';
import authRouter from './routes/auth.routes.js';


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

// Mount API routes
app.use('/auth', authRouter);

app.use("/", healthRoutes);


// ---------------------------
// ERROR HANDLING / MANEJO DE ERRORES
// ---------------------------
app.use(notFoundHandler);
app.use(errorMiddleware);

app.listen(PORT, () => {
    logger.info(`Server running at: ${BACKEND_URL}${PORT}`)
})