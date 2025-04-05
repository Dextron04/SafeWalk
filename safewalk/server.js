import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Add middleware to parse JSON bodies

// Root route to test the server
app.get('/', (req, res) => {
  res.send('SafeWalk API is running!');
});

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

app.post('/api/directions', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' });
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        mode: 'driving',
        key: GOOGLE_API_KEY
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching directions:', err.message);
    res.status(500).json({ error: 'Failed to fetch directions' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
