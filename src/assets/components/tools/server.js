const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
const port = 3001; // Puedes cambiar el puerto

app.use(express.json()); // Para procesar el cuerpo de la solicitud como JSON

app.get('/api/recommendations', async (req, res) => {
  try {
    const { tipoDeCultivo, nombreDelCultivo } = req.query;
    const data = JSON.parse(req.query.data); // Convertir la cadena JSON a un objeto

    const vertexAI = new VertexAI({ project: 'YOUR_PROJECT_ID', location: 'us-central1' }); // Reemplaza YOUR_PROJECT_ID
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
    });

    // Construir el prompt (incluyendo los datos meteorológicos)
    let prompt = `Dado el tipo de plantación ${tipoDeCultivo}, calcula el promedio de las variables relevantes y realiza una predicción basada en las tendencias observadas. Proporciona recomendaciones específicas para optimizar el rendimiento de la plantación, en este caso ${nombreDelCultivo}.`;

    if (data && data.properties && data.properties.parameter) {
      const { properties } = data;
      const { parameter } = properties;
      const temperatureData = parameter.T2M;
      const dewPointData = parameter.T2MDEW;
      const wetBulbData = parameter.T2MWET;
      const surfaceTempData = parameter.TS;
      const precipitationData = parameter.PRECTOTCORR;
      const relativeHumidityData = parameter.RH2M;
      const windSpeedData = parameter.WS10M;
      const windDirectionData = parameter.WD10M;
      const solarRadiationAllSkyData = parameter.ALLSKY_SFC_SW_DWN;
      const solarRadiationClearSkyData = parameter.CLRSKY_SFC_SW_DWN;
      const specificHumidityData = parameter.QV2M;
      const cloudCoverData = parameter.CLOUDTOT;
      const snowAccumulationData = parameter.ASNOW;

      prompt += `

        Datos climáticos:
        Temperatura: ${JSON.stringify(temperatureData)}
        Dew Point: ${JSON.stringify(dewPointData)}
        Wet Bulb Temperature: ${JSON.stringify(wetBulbData)}
        Surface Temperature: ${JSON.stringify(surfaceTempData)}
        Precipitation: ${JSON.stringify(precipitationData)}
        Relative Humidity: ${JSON.stringify(relativeHumidityData)}
        Wind Speed: ${JSON.stringify(windSpeedData)}
        Wind Direction: ${JSON.stringify(windDirectionData)}
        Solar Radiation (All Sky): ${JSON.stringify(solarRadiationAllSkyData)}
        Solar Radiation (Clear Sky): ${JSON.stringify(solarRadiationClearSkyData)}
        Specific Humidity: ${JSON.stringify(specificHumidityData)}
        Cloud Cover: ${JSON.stringify(cloudCoverData)}
        Snow Accumulation: ${JSON.stringify(snowAccumulationData)}
      `;
    }

    const resp = await generativeModel.generateContent(prompt);
    const contentResponse = await resp.response;

    res.json({ recommendations: contentResponse.text });
  } catch (error) {
    console.error("Error al generar recomendaciones:", error);
    res.status(500).json({ error: "Error al generar recomendaciones" });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});