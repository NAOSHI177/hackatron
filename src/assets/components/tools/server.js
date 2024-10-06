import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';

const app = express();
const port = 3001;
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.json());

app.post('/api/recommendations', async (req, res) => {
  console.log("Request received at /api/recommendations");
  try {
    const { tipoDeCultivo, nombreDelCultivo, data, latitud, longitud } = req.body;

    const vertexAI = new VertexAI({ project: 'alpha-agro-space', location: 'us-central1' });
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
    });

    // Create a plain text prompt with all available data
    let prompt = `We are analyzing a planting of ${tipoDeCultivo} in ${nombreDelCultivo}, located at latitude ${latitud} and longitude ${longitud}. 
    Here are the recent climatic data for analysis and yield prediction:

    - Temperature: ${JSON.stringify(data.T2M)}
    - Dew Point: ${JSON.stringify(data.T2MDEW)}
    - Wet Bulb Temperature: ${JSON.stringify(data.T2MWET)}
    - Surface Temperature: ${JSON.stringify(data.TS)}
    - Precipitation: ${JSON.stringify(data.PRECTOTCORR)}
    - Relative Humidity: ${JSON.stringify(data.RH2M)}
    - Wind Speed: ${JSON.stringify(data.WS10M)}
    - Wind Direction: ${JSON.stringify(data.WD10M)}
    - Solar Radiation (Clear Sky): ${JSON.stringify(data.CLRSKY_SFC_SW_DWN)}
    - Solar Radiation (All Sky): ${JSON.stringify(data.ALLSKY_SFC_SW_DWN)}
    - Specific Humidity: ${JSON.stringify(data.QV2M)}
    
    Based on these climatic data and the location of the planting, please calculate the following metrics:
    
    1. Average of the relevant climatic variables (such as temperature, humidity, precipitation, etc.).
    2. Predictions for the next season: Make predictions for the crop yield considering current climatic conditions.
    3. Specific recommendations: Provide recommendations to optimize the yield of the ${nombreDelCultivo} planting, such as adjustments in fertilizer use, irrigation, or changes in the planting date based on climatic predictions.
    `;

    // Send the prompt to the model
    const resp = await generativeModel.generateContent(prompt);

    // Verify and process the model's response
    console.log("Full response object:", JSON.stringify(resp, null, 2));

    if (resp.response && resp.response.candidates && resp.response.candidates.length > 0) {
      const candidate = resp.response.candidates[0];
      console.log("Candidate object:", JSON.stringify(candidate, null, 2));

      if (candidate.content) {
        const recommendationText = candidate.content.parts[0].text || "No recommendations were generated.";
        res.json({ recommendations: recommendationText });
      } else {
        console.error("Content field is missing in the candidate");
        res.status(500).json({ error: "Content field is missing in the response" });
      }
    } else {
      console.error("No candidates found in response");
      res.status(500).json({ error: "No candidates found in response" });
    }
  } catch (error) {
    console.error("Error generating recommendations:", error.message || error);
    res.status(500).json({ error: "Error generating recommendations" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
