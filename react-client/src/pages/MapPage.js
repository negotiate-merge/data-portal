import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import httpClient from '../httpClient';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";


const MapPage = () => {
  const [data, setData] = useState([{}]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
      const res = await httpClient.get("/device-map")
        setData(res.data);
        console.log("res.data", res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }  
    fetchDevices();
  }, []);


  // Get these from a .env file import in the future
  const api_key = "AIzaSyBpXO0jdlDMJnqNQUtiwOsfoawY3PdlDKM";
  const map_id = "1a3de3b04bbcad29";


  return (
    <APIProvider apiKey={api_key}>
      <div style={{height: "100vh"}}>
        <Map
          defaultZoom={16}
          defaultCenter={{ lat: -31.5566128, lng: 143.3754706 }}
          mapId={map_id}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          {data.map((point) => (
            <Marker key={point.devId} point={point} />
          ))}
        </Map>
      </div>
    </APIProvider>
  )
}

const Marker = ({point}) => {

  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false); // Switch for info-window

  const handleMarkerClick = useCallback(() => setInfoWindowShown(isShown => !isShown), []);
  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  if (!point.lat || !point.lng) {
    console.error('Latitude or longitude is missing for point', point);
    return null;
  }

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: parseFloat(point.lat), lng: parseFloat(point.lng) }} 
      key={point.devId}
      title={point.title}
      onClick={handleMarkerClick}
    >
    <Pin />
    {infoWindowShown && 
      <InfoWindow className="iwColumn" anchor={marker} onClose={handleClose}>
        <div>
          <table>
            <tbody>
              <tr>
                <td>Site name:</td><td>{point.siteName}</td>
              </tr>
              <tr>
                <td>DevID:</td><td>{point.devId}</td>
              </tr>
              <tr>
                <td>Pressure:</td><td>{point.data.pressure}</td>
              </tr>
              <tr>
                <td>Flow:</td><td>{point.data.flow}</td>
              </tr>
            </tbody>
          </table>
          <Link to={`/site-data/${point.devId}`}>Go to site data</Link>
        </div>
      </InfoWindow> }
    </AdvancedMarker>
  );
};

export default MapPage