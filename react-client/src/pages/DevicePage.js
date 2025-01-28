import React, { useState, useEffect }from 'react'
import { useParams } from 'react-router-dom'
import httpClient from '../httpClient';
import LineGraph from '../LineGraph';


const DevicePage = () => {
  const { devId } = useParams();
  // const [data, setData] = useState();

  console.log("received devId", devId);

  /*
  useEffect(() => {
    const getData = async () => {
      try {
      const res = await httpClient.get(`/site-data/${devId}`)
        setData(res.data);
        console.log("res.data", res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }  
    getData();
  }, []);

  

  if (!data) {
    return <div>Loading...</div>
  }
  */

  return (
    <>
      <div className="device-page">
        <h3>DevicePage for ID: { devId }</h3>
        <LineGraph device={devId}/>
      </div>
    </>
  )
}

export default DevicePage