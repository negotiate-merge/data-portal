import React, { useState, useEffect }from 'react'
import { useParams, useLocation } from 'react-router-dom'
import LineGraph from '../LineGraph';
import { color } from 'd3';


const DevicePage = () => {
  const { devId } = useParams();
  const location = useLocation();
  const { siteName, data } = location.state || {};

  return (
    <>
      <div className="device-page">
        <h3 style={{ color: "linen" }}>Sewer Assest: { siteName }</h3>
        <LineGraph device={devId}/>
      </div>
    </>
  )
}

/* Remove jsx from return element above
        <p>Latest data received</p>
        <pre>{JSON.stringify(data)}</pre>
*/

export default DevicePage