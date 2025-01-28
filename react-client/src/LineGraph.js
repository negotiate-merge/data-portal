import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LineGraph = ({ device }) => {
  // const [data, setData] = useState([25, 30, 45, 60, 20, 65, 70]); 
  const svgRef = useRef();
  const width = 1200;
  const height = 500;

  useEffect(() => {
    // const svg = d3.select(svgRef.current);
    d3.csv(`/site-data/${device}`).then(function (data) {

      // Change number strings to numbers
      data.forEach(d => {
        d.Time = new Date(d.Time);
        d.Pressure = +d.Pressure;
        d.Flow = +d.Flow;
      })

      d3.select("svg").remove();

      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
      const width = 1000 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const minPressure = d3.min(data, d => d.Pressure);
      const maxPressure = d3.max(data, d => d.Pressure);
      console.log(`min Pressure ${minPressure}, max Pressure ${maxPressure}`)

      const svg = d3.select("#pressure-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Time))   // Time range
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, Math.ceil(maxPressure)])  // Round the highest reading up to nearest integer
        .range([height, 0]);

      
      const xAxis = d3.axisBottom(xScale)
        .ticks(data.length)
        .tickFormat(d3.timeFormat("%H:%M"));

      svg
        .append("g")
        .attr("class", "x-axis")  // .select(".x-axis")
        .attr("transform", `translate(0,${height})`) // .style("transform", `translateY(${height}px)`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end"); 

      const yAxis = d3.axisLeft(yScale)
        .ticks(5);
      svg.append("g")
        .attr("class", "y-axis")  // .select(".y-axis")
        //.style("transform", "translateX(0px)")
        .call(yAxis);

      // Add label x axis
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom + 10)
        .style("text-anchor", "middle")
        .text("Time");

      // Add label y axis
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Pressure")

      const myLine = d3.line()
        .x(d => xScale(d.Time))
        .y(d => yScale(d.Pressure))
        .curve(d3.curveCardinal);
      
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 4)
        .attr("d", myLine);

    })
  }, []); // Removed data as a dependency

  return (
    <div id="pressure-container">

    </div>
  )
}

export default LineGraph;