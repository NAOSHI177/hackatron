import { useState, useEffect } from "react";

function NASAData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [plantingRecommendations, setPlantingRecommendations] = useState(null);
  const [tipoDeCultivo, setTipoDeCultivo] = useState('');
  const [nombreDelCultivo, setNombreDelCultivo] = useState('');

  const url = "https://power.larc.nasa.gov/api/temporal/hourly/point";
  const params = {
    start: "20230912",
    parameters: "T2M,T2MDEW,T2MWET,TS,PS,RH2M,PRECTOTCORR,WS10M,WD10M,ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,QV2M",
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
    console.log("URL completa:", fullUrl);
    const fetchData = async () => {
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
          console.error("Error details:", response);
          const message = `Error al obtener datos de la NASA: ${response.status} ${response.statusText}`;
          throw new Error(message);
        }
        const jsonData = await response.json();
        console.log("Datos de la NASA:", jsonData);
        setData(jsonData);
      } catch (error) {
        setError(error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const filteredData = {
        T2M: data.properties.parameter.T2M,
        T2MDEW: data.properties.parameter.T2MDEW,
        T2MWET: data.properties.parameter.T2MWET,
        TS: data.properties.parameter.TS,
        PRECTOTCORR: data.properties.parameter.PRECTOTCORR,
        RH2M: data.properties.parameter.RH2M,
        WS10M: data.properties.parameter.WS10M,
        WD10M: data.properties.parameter.WD10M,
        ALLSKY_SFC_SW_DWN: data.properties.parameter.ALLSKY_SFC_SW_DWN,
        CLRSKY_SFC_SW_DWN: data.properties.parameter.CLRSKY_SFC_SW_DWN,
        QV2M: data.properties.parameter.QV2M,
      };
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipoDeCultivo: tipoDeCultivo,
          nombreDelCultivo: nombreDelCultivo,
          data: filteredData 
        })
      });

      if (!response.ok) {
        console.error("Error details:", response);
        const message = `Error al obtener recomendaciones: ${response.status} ${response.statusText}`;
        throw new Error(message);
      }

      const jsonData = await response.json();
      setPlantingRecommendations(jsonData.recommendations);
    } catch (error) {
      console.error("Error al obtener recomendaciones:", error);
      setError(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="tipoDeCultivo">Tipo de Cultivo:</label>
          <input
            type="text"
            id="tipoDeCultivo"
            value={tipoDeCultivo}
            onChange={(e) => setTipoDeCultivo(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="nombreDelCultivo">Nombre del Cultivo:</label>
          <input
            type="text"
            id="nombreDelCultivo"
            value={nombreDelCultivo}
            onChange={(e) => setNombreDelCultivo(e.target.value)}
          />
        </div>
        <button type="submit">Obtener Recomendaciones</button>
      </form>

      {error && <div>Error: {error.message}</div>}
      {plantingRecommendations ? (
        <div>
          <h1>Respuesta de Geminis:</h1>
          <h2>Recomendaciones para la plantación de {nombreDelCultivo}:</h2>
          <p>{plantingRecommendations}</p>
        </div>
      ) : (
        !error && <div>Cargando...</div>
      )}
    </div>
  );
}

export default NASAData;