import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

function NASAData() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyDDs9_d0wrqaBVUThUKZDld6mtZlz8A1hE' // Replace with your API key
  });

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: -25.5087, lng: -54.6483 });
  const center = useRef({ lat: -25.5087, lng: -54.6483 });
  const [selectedPosition, setSelectedPosition] = useState({ lat: null, lng: null }); // State for selected position

  const onLoad = React.useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (event) => {
    const latLng = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setSelectedPosition(latLng); // Update the selected position
    setMarkerPosition(latLng); // Update the marker position to the clicked location
  };

  useEffect(() => {
    if (map) {
      const newMarker = new window.google.maps.Marker({
        position: markerPosition,
        map: map,
      });

      // Cleanup function to remove the marker when the component unmounts
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
    start: "20190912",
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
    console.log("Complete URL:", fullUrl);
    const fetchData = async () => {
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
          console.error("Error details:", response);
          const message = `Error fetching NASA data: ${response.status} ${response.statusText}`;
          throw new Error(message);
        }
        const jsonData = await response.json();
        console.log("NASA data:", jsonData);
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
      setError(new Error("NASA data or geolocation is not yet available. Please wait."));
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

      console.log("Filtered data:", filteredData);

      const response = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipoDeCultivo: tipoDeCultivo,
          nombreDelCultivo: nombreDelCultivo,
          data: filteredData,
          latitud: selectedPosition.lat,   // Send the selected latitude
          longitud: selectedPosition.lng   // Send the selected longitude
        })
      });

      if (!response.ok) {
        const message = `Error fetching recommendations: ${response.status} ${response.statusText}`;
        throw new Error(message);
      }

      const jsonData = await response.json();
      setPlantingRecommendations(jsonData.recommendations);
      setError(null);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError(error);
    }
  };

  return isLoaded ? (
    <>
      <div className="ctn-tool-main">
        <div className="login-box">
          <h2>Insert Data</h2>
          {data ? (
            <form onSubmit={handleSubmit}>
              <div className="user-box">
                <input
                  type="text"
                  id="tipoDeCultivo"
                  value={tipoDeCultivo}
                  onChange={(e) => setTipoDeCultivo(e.target.value)}
                />
                <label htmlFor="tipoDeCultivo">Crop Type: </label>
              </div>
              <div className="user-box">
                <input
                  type="text"
                  id="nombreDelCultivo"
                  value={nombreDelCultivo}
                  onChange={(e) => setNombreDelCultivo(e.target.value)}
                />
                <label htmlFor="nombreDelCultivo">Crop Name:</label>
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
                    <div className="Lati-logti">
                      Latitude: {selectedPosition.lat}
                      <br />
                      Longitude: {selectedPosition.lng}
                    </div>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div>Loading NASA data...</div>
          )}
        </div>
        <div className="chat">
          <div className="chat-title">
            <h1>Gemini 1.5 pro</h1>
            <h2>@gemini</h2>
            <figure className="avatar">
              <img src="https://play-lh.googleusercontent.com/Pkwn0AbykyjSuCdSYCbq0dvOqHP-YXcbBLTZ8AOUZhvnRuhUnZ2aJrw_YCf6kVMcZ4PM=w240-h480-rw" />
            </figure>
          </div>
          <div className="messages">
            <div className="messages-content"><div>
              {error && <div>Error: {error.message}</div>}
              {plantingRecommendations && (
                <div className="div-respuesta">
                  <h2>Recommendations for the planting of {nombreDelCultivo}:</h2>
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
