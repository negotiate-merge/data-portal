import React, { useState, useEffect }from 'react'
import { useParams, useLocation } from 'react-router-dom'
import LineGraph from '../LineGraph';


const DashBoard = () => {
  const { devId } = useParams();
  const location = useLocation();
  const { siteName, data } = location.state || {};

  return (
    <>
      <div>
        <h1>Dashboard</h1>
        <div className="dashboard-container">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="dashboard-graph">
              Graph {index + 1}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
//         <LineGraph device={devId}/>
export default DashBoard