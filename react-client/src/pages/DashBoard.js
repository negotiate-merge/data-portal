import React, { useState, useEffect }from 'react'
import LineGraph from '../LineGraph';
import httpClient from '../httpClient';


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
  const devices = data.devices.map(device => device.devId);
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
      <div className="dash">
        <h1>All Devices</h1>
        <div className="dashboard-container">
          {devices.map((devId, index) => (
            <div key={index} className='device-box'>
              <p>devId: {`${devId}`}</p>
              <div className="dashboard-graph" id={`pressure-container-${index}`}>
                <LineGraph device={devId} graphId={`pressure-container-${index}`} metric="Pressure"/>
              </div>
              <div className="dashboard-graph" id={`flow-container-${index}`}>
                <LineGraph device={devId} graphId={`flow-container-${index}`} metric="Flow"/>
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