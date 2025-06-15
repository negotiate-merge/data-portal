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
        <div className='graph-wrapper'>
          <div id="pressure-container" className='s-card graph-card'>
            <LineGraph device={devId} graphId="pressure-container" metric="Pressure"/>
          </div>
        </div>
        <div className='graph-wrapper'>
          <div id="flow-container" className='s-card graph-card'>
            <LineGraph device={devId} graphId="flow-container" metric="Flow"/>
          </div>
        </div>

        {/* Previous for reference
        <div className='graph-wrapper'>
          <div id="flow-container" className='s-card graph-card'></div>
        </div> */}
        
      </div>
    </>
  )
}

export default DevicePage;