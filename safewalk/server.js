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

// Directions API endpoint with built-in validation
app.post('/api/directions', async (req, res) => {
  const { origin, destination, mode = 'walking', alternatives = true } = req.body;

  // Validate required parameters
  if (!origin || !destination) {
    return res.status(400).json({
      status: 'ERROR',
      error: 'Origin and destination are required'
    });
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        mode,
        alternatives,
        key: GOOGLE_API_KEY
      }
    });

    // Check if the API returned an error
    if (response.data.status !== 'OK') {
      return res.status(400).json({
        status: 'ERROR',
        error: response.data.error_message || 'Failed to fetch directions',
        details: response.data
      });
    }

    res.json(response.data);
  } catch (err) {
    console.error('API Error:', err.message);

    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(err.response.status).json({
        status: 'ERROR',
        error: err.response.data.error_message || 'Google API error',
        details: err.response.data
      });
    } else if (err.request) {
      // The request was made but no response was received
      return res.status(503).json({
        status: 'ERROR',
        error: 'No response from Google API'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({
        status: 'ERROR',
        error: 'Failed to process request'
      });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SafeWalk API server running on http://localhost:${PORT}`));
