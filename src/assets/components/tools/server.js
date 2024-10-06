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

    // console.log("Datos climáticos recibidos:");
    // console.log("Temperatura:", JSON.stringify(data.T2M, null, 2));
    // console.log("Punto de rocío:", JSON.stringify(data.T2MDEW, null, 2));
    // console.log("Temperatura del bulbo húmedo:", JSON.stringify(data.T2MWET, null, 2));
    // console.log("Temperatura de la superficie:", JSON.stringify(data.TS, null, 2));
    // console.log("Precipitación:", JSON.stringify(data.PRECTOTCORR, null, 2));
    // console.log("Humedad relativa:", JSON.stringify(data.RH2M, null, 2));
    // console.log("Velocidad del viento:", JSON.stringify(data.WS10M, null, 2));
    // console.log("Dirección del viento:", JSON.stringify(data.WD10M, null, 2));
    // console.log("Radiación solar (cielo despejado):", JSON.stringify(data.CLRSKY_SFC_SW_DWN, null, 2));
    // console.log("Radiación solar (cielo cubierto):", JSON.stringify(data.ALLSKY_SFC_SW_DWN, null, 2));
    // console.log("Humedad específica:", JSON.stringify(data.QV2M, null, 2));
    
    const vertexAI = new VertexAI({ project: 'alpha-agro-space', location: 'us-central1' });
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
    });

    // Crear un prompt más detallado con todos los datos disponibles
    let prompt = `Estamos analizando una plantación de ${tipoDeCultivo} en ${nombreDelCultivo}, ubicada en la latitud ${latitud} y longitud ${longitud}. 
    Aquí están los datos climáticos recientes para el análisis y la predicción del rendimiento:

    - **Temperatura**: ${JSON.stringify(data.T2M)}
    - **Punto de rocío**: ${JSON.stringify(data.T2MDEW)}
    - **Temperatura del bulbo húmedo**: ${JSON.stringify(data.T2MWET)}
    - **Temperatura de la superficie**: ${JSON.stringify(data.TS)}
    - **Precipitación**: ${JSON.stringify(data.PRECTOTCORR)}
    - **Humedad relativa**: ${JSON.stringify(data.RH2M)}
    - **Velocidad del viento**: ${JSON.stringify(data.WS10M)}
    - **Dirección del viento**: ${JSON.stringify(data.WD10M)}
    - **Radiación solar (cielo despejado)**: ${JSON.stringify(data.CLRSKY_SFC_SW_DWN)}
    - **Radiación solar (cielo cubierto)**: ${JSON.stringify(data.ALLSKY_SFC_SW_DWN)}
    - **Humedad específica**: ${JSON.stringify(data.QV2M)}
    
    Con base en estos datos climáticos y la ubicación de la plantación, por favor calcula las siguientes métricas:
    
    1. **Promedio de las variables climáticas relevantes** (como temperatura, humedad, precipitación, etc.).
    2. **Predicciones para la próxima temporada**: Haz predicciones para el rendimiento del cultivo, considerando las condiciones climáticas actuales.
    3. **Recomendaciones específicas**: Proporciona recomendaciones para optimizar el rendimiento de la plantación de ${nombreDelCultivo}, como ajustes en el uso de fertilizantes, riego, o cambios en la fecha de siembra, con base en las predicciones climáticas.
    `;

    // Enviar el prompt al modelo
    const resp = await generativeModel.generateContent(prompt);

    // Verificar y procesar la respuesta del modelo
    console.log("Full response object:", JSON.stringify(resp, null, 2));

    if (resp.response && resp.response.candidates && resp.response.candidates.length > 0) {
      const candidate = resp.response.candidates[0];
      console.log("Candidate object:", JSON.stringify(candidate, null, 2));

      if (candidate.content) {
        const recommendationText = candidate.content.parts[0].text || "No se generaron recomendaciones.";
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
    console.error("Error al generar recomendaciones:", error.message || error);
    res.status(500).json({ error: "Error al generar recomendaciones" });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
