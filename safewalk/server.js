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

// 911 Calls API endpoint
app.get('/api/911calls', async (req, res) => {
  try {
    // Get query parameters
    const { format = 'full' } = req.query;

    // Fetch 911 calls from SFPD API
    const response = await axios.get(
      `https://data.sfgov.org/resource/gnap-fj3t.json?$order=received_datetime DESC`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from SFPD API');
    }

    const data = response.data;
    console.log(`Fetched ${data.length} 911 calls from SFPD API`);

    // Get current date for comparison
    const today = new Date();

    // Check if we have future-dated data (test data)
    const hasFutureData = data.some(call => {
      const callDate = new Date(call.received_datetime);
      return callDate > today;
    });

    if (hasFutureData) {
      console.log('Detected future-dated data in the API response (likely test data)');
    }

    // Process calls with coordinates
    const validCalls = data.filter(call =>
      call.intersection_point &&
      call.intersection_point.coordinates &&
      call.intersection_point.coordinates.length === 2
    );

    console.log(`Found ${validCalls.length} calls with valid coordinates`);

    // Format call date for display
    const formatCallDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    };

    // Process calls with raw data
    const processedCalls = validCalls.map(call => ({
      id: call.id,
      time: formatCallDate(call.received_datetime),
      rawTime: new Date(call.received_datetime).getTime(), // Store raw timestamp for sorting
      location: call.intersection_name || 'Unknown Location',
      callType: call.call_type_final_desc,
      callTypeOriginal: call.call_type_original_desc,
      priority: call.priority_final,
      agency: call.agency,
      sensitive: call.sensitive_call,
      latitude: call.intersection_point.coordinates[1],
      longitude: call.intersection_point.coordinates[0],
      isFuture: new Date(call.received_datetime) > today,
      // Include additional fields from the raw data
      received_datetime: call.received_datetime,
      entry_datetime: call.entry_datetime,
      dispatch_datetime: call.dispatch_datetime,
      enroute_datetime: call.enroute_datetime,
      cad_number: call.cad_number,
      onview_flag: call.onview_flag
    }))
      .sort((a, b) => b.rawTime - a.rawTime); // Sort by most recent using raw timestamp

    // Group calls by location to identify hotspots
    const locationGroups = {};

    validCalls.forEach(call => {
      const lat = call.intersection_point.coordinates[1];
      const lng = call.intersection_point.coordinates[0];

      // Round coordinates to create grid cells (approximately 100m x 100m)
      const gridLat = Math.round(lat * 100) / 100;
      const gridLng = Math.round(lng * 100) / 100;
      const key = `${gridLat},${gridLng}`;

      if (!locationGroups[key]) {
        locationGroups[key] = {
          lat: gridLat,
          lng: gridLng,
          count: 0,
          calls: []
        };
      }

      locationGroups[key].count++;
      locationGroups[key].calls.push(call);
    });

    // Convert to array and sort by count
    const hotspots = Object.values(locationGroups)
      .sort((a, b) => b.count - a.count);

    // Find the maximum count for scaling
    const maxCount = hotspots.length > 0 ? hotspots[0].count : 1;

    // Return different formats based on the request
    if (format === 'hotspots') {
      // Return just the hotspots data
      res.json({
        hotspots,
        maxCount,
        totalHotspots: hotspots.length
      });
    } else if (format === 'calls') {
      // Return just the processed calls
      res.json({
        calls: processedCalls,
        totalCalls: processedCalls.length
      });
    } else {
      // Return the full data
      res.json({
        calls: processedCalls,
        hotspots,
        maxCount,
        totalCalls: processedCalls.length,
        totalHotspots: hotspots.length,
        hasFutureData
      });
    }
  } catch (err) {
    console.error('Error fetching 911 calls:', err);
    res.status(500).json({
      status: 'ERROR',
      error: 'Failed to fetch 911 calls data',
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SafeWalk API server running on http://localhost:${PORT}`));
