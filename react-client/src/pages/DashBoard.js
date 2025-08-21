import { useState, useEffect, useContext }from 'react'
import LineGraph from '../LineGraph';
import useAxios from '../useAxios';
import { Link } from 'react-router-dom';
import { UserContext } from '../UserContext';



const DashBoard = () => {
  const [ data, setData ] = useState({ devices: [] });
  const [ loading, setLoading ] = useState(true);
  const api = useAxios();
  const { user } = useContext(UserContext);


  console.log(`Dashboard has user ${user}`);
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await api.get("/device-map");
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    }
    fetchDevices();
  }, []);

  const devices = data.devices.map(device => ({
    devId: device.devId, 
    siteName: device.siteName,
}));

  if (loading) {
    return (
      <div>
        <p>Loading Dashborad...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1>{`${data.company}`}</h1>
        <div className="container">{/*<div className="dashboard-container"></div>*/}
          {devices.map((device, index) => (
            <div key={index} className='device-box'>
              <p>{`${device.siteName} - `}
                <Link 
                  to={(`/site-data/${device.devId}?days=0&siteName=${encodeURIComponent(device.siteName)}`)}
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
export default DashBoard