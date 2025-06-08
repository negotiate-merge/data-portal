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
      
      <svg width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75ZM1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12Z" fill="red"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.50685 12.9974C6.81893 12.7251 7.29271 12.7573 7.56507 13.0693L9.25 15L9.25 7C9.25 6.58579 9.58579 6.25 10 6.25C10.4142 6.25 10.75 6.58579 10.75 7V17C10.75 17.3126 10.5561 17.5925 10.2633 17.7022C9.97062 17.812 9.6405 17.7287 9.43493 17.4932L6.43493 14.0557C6.16257 13.7436 6.19477 13.2698 6.50685 12.9974Z" fill="orange"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M13.7367 6.29775C13.4439 6.40753 13.25 6.68737 13.25 7L13.25 17C13.25 17.4142 13.5858 17.75 14 17.75C14.4142 17.75 14.75 17.4142 14.75 17L14.75 9L16.4349 10.9306C16.7073 11.2427 17.1811 11.2749 17.4932 11.0026C17.8052 10.7302 17.8374 10.2564 17.5651 9.94435L14.5651 6.50685C14.3595 6.2713 14.0294 6.18798 13.7367 6.29775Z" fill="orange"/>
      </svg>
      {/* THIS IS THE OLD VERSION.. NOT NEEDED 
      <svg width="20" height="20" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" />
      </svg> */}
      


    
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
          <Link 
            to={`/site-data/${point.devId}`}
            state={point}>Go to site data
          </Link>
        </div>
      </InfoWindow> }
    </AdvancedMarker>
  );
};

export default Marker;