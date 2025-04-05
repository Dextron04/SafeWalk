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

// Route Assistant endpoint using Google Gemini
app.post('/api/route-assistant', async (req, res) => {
  const { selectedRoute, allRoutes, routeAlerts, userLocation, startLocation, endLocation, userQuery } = req.body;

  console.log("all routes data: ", allRoutes);


  if (!selectedRoute || !userQuery) {
    return res.status(400).json({ error: 'Route and user query are required' });
  }

  try {
    // Create a detailed context for the AI
    let routeDetails = `Selected Route: ${selectedRoute.distance}, ${selectedRoute.duration}`;

    if (selectedRoute.summary) {
      routeDetails += `\nRoute Summary: ${selectedRoute.summary}`;
    }

    if (selectedRoute.warnings && selectedRoute.warnings.length > 0) {
      routeDetails += `\nWarnings: ${selectedRoute.warnings.join(', ')}`;
    }

    if (selectedRoute.steps && selectedRoute.steps.length > 0) {
      routeDetails += `\n\nRoute Steps:\n${selectedRoute.steps.map((step, index) =>
        `${index + 1}. ${step.instruction} (${step.distance})`
      ).join('\n')}`;
    }

    // Add information about alternative routes
    let alternativeRoutesInfo = '';
    if (allRoutes && allRoutes.length > 1) {
      alternativeRoutesInfo = `\n\nAlternative Routes Available:\n${allRoutes.map((route, index) =>
        `Route ${index + 1}: ${route.distance}, ${route.duration}${route.warnings && route.warnings.length > 0 ? ` (Warnings: ${route.warnings.join(', ')})` : ''}`
      ).join('\n')}`;
    }

    // Add detailed information about 911 calls within 0.2 mile radius from the past 24 hours
    let alertsInfo = '';
    if (routeAlerts && routeAlerts.length > 0) {
      // Group alerts by type
      const alertsByType = {};
      routeAlerts.forEach(alert => {
        const type = alert.callType || alert.description || 'Unknown';
        if (!alertsByType[type]) {
          alertsByType[type] = [];
        }
        alertsByType[type].push(alert);
      });

      // Create a summary of alert types
      const alertTypeSummary = Object.entries(alertsByType)
        .map(([type, alerts]) => `${type}: ${alerts.length} reports`)
        .join(', ');

      alertsInfo = `\n\n911 Reports Within 0.2 Mile Radius (Past 24 Hours):\n`;
      alertsInfo += `Total Reports: ${routeAlerts.length}\n`;
      alertsInfo += `Report Types: ${alertTypeSummary}\n\n`;

      // Add detailed information about each alert
      alertsInfo += `Detailed 911 Reports:\n${routeAlerts.map((alert, index) => {
        const timeInfo = alert.time ? `Time: ${alert.time}` : '';
        const locationInfo = alert.location ? `Location: ${alert.location}` : '';
        const typeInfo = alert.callType ? `Type: ${alert.callType}` : '';
        const descriptionInfo = alert.description && alert.description !== alert.callType ? `Description: ${alert.description}` : '';
        const distanceInfo = alert.distance ? `Distance from route: ${alert.distance}` : '';

        return `${index + 1}. ${[typeInfo, timeInfo, locationInfo, distanceInfo, descriptionInfo]
          .filter(Boolean)
          .join(' | ')}`;
      }).join('\n')}`;
    } else {
      alertsInfo = '\n\nNo 911 reports within 0.2 mile radius of this route in the past 24 hours.';
    }

    // Add location information
    let locationInfo = '';
    if (startLocation) {
      locationInfo += `\nStart Location: ${startLocation.address || `lat: ${startLocation.lat}, lng: ${startLocation.lng}`}`;
    }
    if (endLocation) {
      locationInfo += `\nEnd Location: ${endLocation.address || `lat: ${endLocation.lat}, lng: ${endLocation.lng}`}`;
    }
    if (userLocation) {
      locationInfo += `\nUser Current Location: lat: ${userLocation.lat}, lng: ${userLocation.lng}`;
    }

    // Prepare the prompt for Gemini
    let prompt = `You are a friendly and helpful navigation assistant for SafeWalk, a safety-focused navigation app in San Francisco. 
    
You're having a conversation with a user who is planning a journey from ${startLocation?.address || 'their starting point'} to ${endLocation?.address || 'their destination'}.

${routeDetails}
${alternativeRoutesInfo}
${alertsInfo}
${locationInfo}

User query: "${userQuery}"

Respond in a conversational, friendly manner as if you're having a chat with the user. Don't just summarize information - engage with them directly. Ask follow-up questions when appropriate, show empathy, and provide personalized advice based on their specific situation.

If the user is asking about route alternatives or safety, compare the available routes and recommend the safest option based on the information provided. Consider factors like distance, duration, and proximity to 911 calls.

When discussing 911 reports, focus on incidents within the 0.2 mile radius of the route from the past 24 hours. Provide specific details about:
- The number and types of reports in this immediate vicinity
- When the reports occurred throughout the day (morning, afternoon, evening, night)
- Where the reports are located relative to the route
- Any patterns or clusters of reports that might indicate higher-risk areas
- Safety recommendations based on the report data

You can answer questions about:
- Route details and directions
- Safety concerns and nearby 911 reports
- Alternative route options
- Estimated travel time and distance
- Specific locations along the route
- Navigation assistance
- Any other aspects of the journey

IMPORTANT: Format your response using Markdown syntax. Use headings, bullet points, bold text, and other Markdown elements to make your response clear and readable.`;

    console.log('Sending request to Gemini API with prompt:', prompt.substring(0, 100) + '...');

    // Call Google Gemini API
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GOOGLE_GEMINI_API_KEY
        }
      }
    );

    console.log('Received response from Gemini API:', JSON.stringify(response.data).substring(0, 200) + '...');

    // Check if the response has the expected structure
    if (!response.data || !response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content || !response.data.candidates[0].content.parts || !response.data.candidates[0].content.parts[0]) {
      console.error('Invalid response format from Gemini API:', JSON.stringify(response.data));
      throw new Error('Invalid response format from Gemini API');
    }

    // Extract the response text
    const responseText = response.data.candidates[0].content.parts[0].text;
    console.log('Extracted response text:', responseText.substring(0, 100) + '...');

    res.json({ response: responseText });
  } catch (error) {
    console.error('Error getting response from Gemini:', error);
    console.error('Error details:', error.response ? JSON.stringify(error.response.data) : 'No response data');
    res.status(500).json({
      error: 'Failed to get response from assistant',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SafeWalk API server running on http://localhost:${PORT}`));
