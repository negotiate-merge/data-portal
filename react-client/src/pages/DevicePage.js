import React, { useState, useEffect }from 'react'
import { useParams } from 'react-router-dom'
import httpClient from '../httpClient';
import LineGraph from '../LineGraph';


const DevicePage = () => {
  const { devId } = useParams();
  const [data, setData] = useState();

  console.log("received devId", devId);

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
  }, [devId]); // Fetch data whenever devId chnages - not sure if this is correct?

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div>DevicePage for ID: { data.devId }</div>
      <div>{JSON.stringify(data)}</div>
      <h1>Line Graph with D3 in React</h1>
      <div>
        <LineGraph />
      </div>
    </>
  )
}

export default DevicePage