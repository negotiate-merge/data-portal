import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import httpClient from './httpClient';

const LineGraph = ({ device }) => {
  // const [data, setData] = useState([25, 30, 45, 60, 20, 65, 70]); 
  // const svgRef = useRef();
  // const width = 1200;
  // const height = 500;

  useEffect(() => {
    // const svg = d3.select(svgRef.current);
    d3.csv(`/api/site-data/${device}`).then(function (data) { // Previously path to csv file

      // Change number strings to numbers
      data.forEach(d => {
        d.Time = new Date(d.Time);
        d.Pressure = +d.Pressure;
        d.Flow = +d.Flow;
      })

      console.log(data);

      d3.selectAll("svg").remove();
      
      const margin = { top: 50, right: 30, bottom: 75, left: 50 }; // bottom previously 55
      const width = 1000 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const minPressure = d3.min(data, d => d.Pressure);
      const maxPressure = d3.max(data, d => d.Pressure);
      console.log(`min Pressure ${minPressure}, max Pressure ${maxPressure}`)

      const svg = d3.select("#pressure-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "graph")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Title
      svg.append("text")
        .attr("x", (width / 2))
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Pressure")

      const xScale = d3.scaleTime()
        .domain([d3.min(data, d => d.Time), d3.max(data, d => d.Time)])   // Time range - old -> .domain(d3.extent(data, d => d.Time))
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, Math.ceil(maxPressure)])  // Round the highest reading up to nearest integer
        .range([height, 0]);

      
      const xAxis = d3.axisBottom(xScale)
        .ticks(data.length)
        .tickValues(data.map(d => d.Time))    // This fixed the missing tick from the end of the graph
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

      // Add labels x axis
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 30)
        .style("text-anchor", "middle")
        .text("Time");

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("18 December 2024");

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
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("d", myLine);

      // Flow chart
      const minFlow = d3.min(data, d => d.Flow);
      const maxFlow = d3.max(data, d => d.Flow);
      console.log(`min Pressure ${minFlow}, max Pressure ${maxFlow}`)

      const svgf = d3.select("#flow-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "graph")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      svgf.append("text")
        .attr("x", (width / 2))
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Flow")

      const xScalef = d3.scaleTime()
        .domain(d3.extent(data, d => d.Time))   // Time range
        .range([0, width]);

      const yScalef = d3.scaleLinear()
        .domain([0, Math.ceil(maxFlow)])  // Round the highest reading up to nearest integer
        .range([height, 0]);

      const xAxisf = d3.axisBottom(xScalef)
        .ticks(data.length)
        .tickValues(data.map(d => d.Time))
        .tickFormat(d3.timeFormat("%H:%M"));

      svgf
        .append("g")
        .attr("class", "x-axis")  // .select(".x-axis")
        .attr("transform", `translate(0,${height})`) // .style("transform", `translateY(${height}px)`)
        .call(xAxisf)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end"); 

      const yAxisf = d3.axisLeft(yScalef)
        .ticks(5);
      svgf.append("g")
        .attr("class", "y-axis")  // .select(".y-axis")
        //.style("transform", "translateX(0px)")
        .call(yAxisf);

      // Add label x axis
      svgf.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 30)
        .style("text-anchor", "middle")
        .text("Time");

      svgf.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("18 December 2024")

      // Add label y axis
      svgf.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Flow")

      const myLinef = d3.line()
        .x(d => xScale(d.Time))
        .y(d => yScale(d.Flow));
        // .curve(d3.curveCardinal);
      
      svgf.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("d", myLinef);

    

    })
  }, []); // Removed data as a dependency

  return (
    <>
      <div id="pressure-container"></div>
      <div id="flow-container"></div>
    </>
  )
}

export default LineGraph;