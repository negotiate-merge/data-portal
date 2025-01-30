import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

const Marker = ({point}) => {

  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false); // Switch for info-window

  const handleMarkerClick = useCallback(() => setInfoWindowShown(isShown => !isShown), []);
  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  // console.log("Point", point);

  if (!point.lat || !point.lng) {
    console.error(`Latitude or longitude is missing for point with devId: ${point.devId}`);
    return null;
  } else {
    console.log("casting string co-ordinates to float");
    point.lat = parseFloat(point.lat);
    point.lng = parseFloat(point.lng);
  }

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: point.lat, lng: point.lng }} 
      title={point.title}
      onClick={handleMarkerClick}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" />
      </svg>
    
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

export default Marker;