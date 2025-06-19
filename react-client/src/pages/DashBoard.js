import React, { useState, useEffect }from 'react'
import LineGraph from '../LineGraph';
import httpClient from '../httpClient';
import { Link } from 'react-router-dom';


const DashBoard = () => {
  const [ data, setData ] = useState({ devices: [] });
  

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await httpClient.get("/device-map");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchDevices();
  }, []);


  // console.log("Data:", data);
  const devices = data.devices.map(device => ({
    devId: device.devId, 
    siteName: device.siteName,
}));
  console.log("Devices:", devices);
  
  // Hit site-data/<id> for every devid to get all the data
  // useEffect(() => {
      // Need to go through all devices here and call line graph for each one
      // Need to further refine line graph first
  //     })
  //   )
  // }



  return (
    <>
      <div>
        <h1>{`${data.company}`}</h1>
        <div className="dashboard-container">
          {devices.map((device, index) => (
            <div key={index} className='device-box'>
              <p>{`${device.siteName} - `}
                <Link 
                  to={`/site-data/${device.devId}`}
                  state={device}
                  >more data
                </Link>
              </p>
              <div className="dashboard-graph" id={`pressure-container-${index}`}>
                <LineGraph device={device.devId} graphId={`pressure-container-${index}`} metric="Pressure"/>
              </div>
              <div className="dashboard-graph" id={`flow-container-${index}`}>
                <LineGraph device={device.devId} graphId={`flow-container-${index}`} metric="Flow"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
//         <LineGraph device={devId}/>
export default DashBoard