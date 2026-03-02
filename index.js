import express from 'express';
import { PORT, BACKEND_URL} from './config/config.js';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => {
    res.send("Vinted Tracker API")
})

app.listen(PORT, () => {
    console.log(`Server running at: ${BACKEND_URL}${PORT}`)
})