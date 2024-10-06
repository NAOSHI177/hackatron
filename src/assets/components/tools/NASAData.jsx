import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

function NASAData() {

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyDDs9_d0wrqaBVUThUKZDld6mtZlz8A1hE' // Reemplaza con tu clave de API
  });

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: -25.5087, lng: -54.6483 });
  const center = useRef({ lat: -25.5087, lng: -54.6483 }); 
  const inputRef = useRef(null);
  const [selectedPosition, setSelectedPosition] = useState({ lat: null, lng: null }); // Estado para posición seleccionada

  const onLoad = React.useCallback(function callback(map) {
    setMap(map); 
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  const handleMapClick = (event) => {
    setSelectedPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() }); // Captura la geolocalización
  };

  useEffect(() => {
    if (map) {
      const newMarker = new window.google.maps.Marker({
        position: markerPosition,
        map: map,
      });

      map.addListener('click', handleMapClick); // Evento click en el mapa

      return () => {
        newMarker.setMap(null);
      };

    }
  }, [map, markerPosition]);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [plantingRecommendations, setPlantingRecommendations] = useState(null);
  const [tipoDeCultivo, setTipoDeCultivo] = useState('');
  const [nombreDelCultivo, setNombreDelCultivo] = useState('');

  const url = "https://power.larc.nasa.gov/api/temporal/daily/point";
  const params = {
    start: "20150912",
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

    if (!data || !selectedPosition.lat || !selectedPosition.lng) {
      setError(new Error("Los datos de la NASA o la geolocalización aún no están disponibles. Por favor, espere."));
      return;
    }

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

      const response = await fetch('http://localhost:3001/api/recommendations', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipoDeCultivo: tipoDeCultivo,
          nombreDelCultivo: nombreDelCultivo,
          data: filteredData,
          latitud: selectedPosition.lat,   // Enviamos la latitud seleccionada
          longitud: selectedPosition.lng   // Enviamos la longitud seleccionada
        })
      });

      if (!response.ok) {
        const message = `Error al obtener recomendaciones: ${response.status} ${response.statusText}`; 
        throw new Error(message);
      }

      const jsonData = await response.json();
      setPlantingRecommendations(jsonData.recommendations);
      setError(null); 
    } catch (error) {
      console.error("Error al obtener recomendaciones:", error);
      setError(error);
    }
  };

  return isLoaded ? (
    <>
      <div className="ctn-tool-main">
        <div className="login-box">
          <h2>Login</h2>
          {data ? (
            <form onSubmit={handleSubmit}>
              <div className="user-box">
                <input
                  type="text"
                  id="tipoDeCultivo"
                  value={tipoDeCultivo}
                  onChange={(e) => setTipoDeCultivo(e.target.value)}
                />
                <label htmlFor="tipoDeCultivo">Tipo de Cultivo: </label>
              </div>
              <div className="user-box">
                <input
                  type="text"
                  id="nombreDelCultivo"
                  value={nombreDelCultivo}
                  onChange={(e) => setNombreDelCultivo(e.target.value)}
                />
                <label htmlFor="nombreDelCultivo">Nombre del Cultivo:</label>
              </div>
              <div className="user-box">
                <button type="submit" className="button-29">Send</button> 
                <div>
                  <GoogleMap
                    mapContainerStyle={{ height: '200px', width: '100%', borderRadius: '10px' }}
                    center={center.current}
                    zoom={12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick} 
                  >
                    <Marker position={markerPosition} />
                    {selectedPosition && (
                      <Marker position={selectedPosition} />
                    )}
                  </GoogleMap>
                  {selectedPosition && (
                    <div>
                      Latitud: {selectedPosition.lat}
                      <br />
                      Longitud: {selectedPosition.lng}
                    </div>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div>Cargando datos de la NASA...</div>
          )}
        </div>
        <div className="chat">
            <div className="chat-title">
              <h1>Gemini 1.5 pro</h1>
              <h2>@gemini</h2>
                <figure className="avatar">
                  <img src="https://play-lh.googleusercontent.com/Pkwn0AbykyjSuCdSYCbq0dvOqHP-YXcbBLTZ8AOUZhvnRuhUnZ2aJrw_YCf6kVMcZ4PM=w240-h480-rw" /></figure>
            </div>
            <div className="messages">
              <div className="messages-content"><div>
          {error && <div>Error: {error.message}</div>}
          {plantingRecommendations && (
            <div className="div-respuesta">
              <h2>Recomendaciones para la plantación de {nombreDelCultivo}:</h2>
              <p>{plantingRecommendations}</p>
            </div>
          )}
        </div></div>
            </div>
          </div>
        </div>
    </>
  ) : <></>;
}

export default NASAData;
