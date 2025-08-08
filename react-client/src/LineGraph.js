import { useEffect, } from 'react';
import createGraph from './utils/createGraph';
import * as d3 from 'd3';

const LineGraph = ({ device, graphId, metric, days }) => {
  useEffect(() => {
    // const svg = d3.select(svgRef.current);
    d3.csv(`/api/site-data/${device}?days=${days}`).then(function (data) { 

      const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S")

      // Change number strings to numbers
      data.forEach(d => {
        d.Time = parseDate(d.Time);//new Date(d.Time);
        d.Pressure = +d.Pressure;
        d.Flow = +d.Flow;
      })

      // Remove any svg elements from the dom or page?
      // d3.selectAll("svg").remove();
      createGraph(data, graphId, metric, metric);
      
      const containers = document.getElementsByClassName("container");
      for (let i=0; i<containers.length; i++) {
        if (containers[i].closest('nav')) continue; // Skip container class in nav
        containers[i].classList.add("g-container");
        containers[i].classList.remove("container");
      }

    })
    .catch(function (err) {
      console.error("Error fetching data: ", err);
      if (err.message && err.message.includes("404 NOT FOUND")) {
        // Pass an empty data set if no data returned
        console.log("404 Error detected - no data available");
        createGraph(null, graphId, metric, metric);
      }
    })
  }, []); // Removed data as a dependency

   return null; 
  // Was returning jsx components here but have moved that to the component that makes the call.
}

export default LineGraph;