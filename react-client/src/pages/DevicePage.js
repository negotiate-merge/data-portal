import { useParams, useLocation } from 'react-router-dom'
import LineGraph from '../LineGraph';

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

export default DevicePage;