import { useEffect, } from 'react';
import createGraph from './utils/createGraph';
import * as d3 from 'd3';

const LineGraph = ({ device, graphId, metric, days }) => {
  useEffect(() => {
    // const svg = d3.select(svgRef.current);
    d3.csv(`/api/site-data/${device}?days=${days}`).then(function (data) { 

      const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S")
      
      console.log("raw data: ", data);

      // Change number strings to numbers
      data.forEach(d => {
        d.Time = parseDate(d.Time);//new Date(d.Time);
        d.Pressure = +d.Pressure;
        d.Flow = +d.Flow;
      })

      // console.log("formatted data: ", data);

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
  }, []); // Removed data as a dependency

   return null; 
  // Was returning jsx components here but have moved that to the component that makes the call.
}

export default LineGraph;