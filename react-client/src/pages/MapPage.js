import React, { useState, useEffect, useContext } from 'react';
import httpClient from '../httpClient';
import Marker from '../Marker';
import { UserContext } from '../UserContext';
import {
  APIProvider,
  Map,
} from "@vis.gl/react-google-maps";


const MapPage = () => {
  const [data, setData] = useState([{}]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
      const res = await httpClient.get("/device-map");
        setData(res.data);
        // console.log("res.data", res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }  
    fetchDevices();
  }, []);

  console.log("Data:", data);
  console.log("Lat:", data.lat);
  console.log("Lng:", data.lng);

  // console.log("Device ID's:", data.map(point => point.devId));
  // console.log('user is:', user);


  // Get these from a .env file import in the future
  const api_key = process.env.REACT_APP_MAPS_API_KEY;
  const map_id = "1a3de3b04bbcad29";

  if (!data || !data.lat || !data.lng) {
    return <div>Loading map data...</div>
  }

  return (
    <APIProvider apiKey={api_key}>
      <div className='map-container'>
        <Map
          defaultZoom={14}
          defaultCenter={{ lat: parseFloat(data.lat), lng: parseFloat(data.lng) }}
          mapId={map_id}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          {data.devices.map((point, index) => (
            <Marker key={point.devId || index} point={point} />
          )
          )}
        </Map>
      </div>
    </APIProvider>
  )
}

export default MapPage