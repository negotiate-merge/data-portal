import React, { useState, useEffect }from 'react'
import { useParams, useLocation } from 'react-router-dom'
import LineGraph from '../LineGraph';


const DevicePage = () => {
  const { devId } = useParams();
  const location = useLocation();
  const { siteName, data } = location.state || {};

  return (
    <>
      <div className="device-page">
        <h3>Sewer Assest: { siteName }</h3>
        <p>Latest data received</p>
        <pre>{JSON.stringify(data)}</pre>
        <p>Numbers for pressure and flow are populated currently as dummy figures for the voltage that would be read on the sensor. 
          Depending on the sensor, the respective unit of measurement will be calculated from the voltage.
        </p>
        <LineGraph device={devId}/>
      </div>
    </>
  )
}

export default DevicePage