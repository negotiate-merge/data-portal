import { useParams, useLocation, useSearchParams } from 'react-router-dom'
import LineGraph from '../LineGraph';
import { useEffect } from 'react';

const DevicePage = () => {
  const { devId } = useParams();
  const location = useLocation();
  //const { siteName, data } = location.state || {}; // Probably wont be needing this
  const query = new URLSearchParams(location.search);
  const days = query.get("days") || 1;

  // Get site name from url
  const [searchParams] = useSearchParams();
  const siteName = searchParams.get("siteName");

  useEffect(() => {
    const topDiv = document.getElementById("p-head");
    const bottomDiv = document.getElementById("p-graph");

    if (!topDiv || !bottomDiv) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        topDiv.style.width = `${width}px`;
      }
    });

    observer.observe(bottomDiv);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="device-page container">
        <div id="p-head" className="graph-header">
          <p className="dev-heading">Sewer Assest: { siteName }</p>
          <div className="button-group">
            <a href={`/site-data/${devId}?days=6&siteName=${encodeURIComponent(siteName)}`} className='day-link'>7 Days</a>
            <a href={`/site-data/${devId}?days=0&siteName=${encodeURIComponent(siteName)}`} className='day-link'>1 Day</a>
          </div>
        </div>
        <div id="p-graph" className='graph-wrapper'>
          <div id="pressure-container" className='s-card graph-card'>
            <LineGraph device={devId} graphId="pressure-container" metric="Pressure" days={`${days}`}/>
          </div>
        </div>
        <div className='graph-wrapper'>
          <div id="flow-container" className='s-card graph-card'>
            <LineGraph device={devId} graphId="flow-container" metric="Flow" days={`${days}`}/>
          </div>
        </div>        
      </div>
    </>
  )
}

export default DevicePage;