import { useState, useEffect } from "react";
import { VertexAI } from '@google-cloud/vertexai';

function NASAData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [plantingRecommendations, setPlantingRecommendations] = useState(null);

  // Define el tipo de cultivo y el nombre del cultivo
  const tipoDeCultivo = "soja"; // Reemplaza con el tipo de cultivo real
  const nombreDelCultivo = "soja transgénica"; // Reemplaza con el nombre del cultivo real

  const url = "https://power.larc.nasa.gov/api/temporal/hourly/point";
  const params = {
    start: "20230912",
    parameters: "T2M,T2MDEW,T2MWET,TS,PRECTOTCORR,RH2M,WS10M,WD10M,ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,QV2M,CLOUDTOT,ASNOW",
    community: "AG",
    latitude: "-25.5097",
    longitude: "-54.6111",
    format: "json",
    end: "20240912",
  };

  const queryParams = new URLSearchParams(params);
  const encodedQueryParams = queryParams.toString();
  const fullUrl = `${url}?${encodedQueryParams}`;

  useEffect(() => {
    const fetchData = async () => {
      console.log("URL completa:", fullUrl);

      try {
        const response = await fetch(fullUrl);
        console.log(response);
        if (!response.ok) {
          console.error("Error details:", response);
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        console.log(jsonData);
        setData(jsonData);
      } catch (error) {
        setError(error);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  useEffect(() => {
    const generatePlantingRecommendations = async () => {
      try {
        const vertexAI = new VertexAI({ project: 'alpha-agro-space', location: 'us-central1' });
        const generativeModel = vertexAI.getGenerativeModel({
          model: 'gemini-1.5-flash-001',
        });

        // Construir el prompt (incluyendo los datos meteorológicos si están disponibles)
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
        setPlantingRecommendations(contentResponse.text);
      } catch (error) {
        console.error("Error al generar recomendaciones:", error);
        setError(error);
      }
    };

    // Llamar a la función incondicionalmente
    generatePlantingRecommendations();
  }, [tipoDeCultivo, nombreDelCultivo, data]);

  // Muestra los datos
  return (
    <div>
      <h1>Respuesta de Geminis: </h1>
      {plantingRecommendations && <h2>Recomendaciones para la plantación:</h2>}
      {plantingRecommendations && <p>{plantingRecommendations}</p>}

      {/* ... (opcionalmente mostrar los datos meteorológicos) ... */}
    </div>
  );
}

export default NASAData;