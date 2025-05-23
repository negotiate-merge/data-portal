import React, { useEffect, } from 'react';
import * as d3 from 'd3';
import { timeFormat } from 'd3'; 


const createGraph = (data, containerId, metric, title, color="steelblue") => {
  const margin = { top: 50, right: 30, bottom: 75, left: 35 }; // bottom previously 55
  const width = 1000 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const maxValue = d3.max(data, d => d[metric]);

  // console.log(data);
  // console.log("Metric values sample:", data.slice(0, 3).map(d => d[metric]));
  const formatDate = timeFormat("%d %B %Y");
  const date = formatDate(d3.max(data, d => d.Time));
  // console.log(formatDate(date));

  // Create svg element, set up sizes
  const svg = d3.select(`#${containerId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "graph")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Graph Title
  svg.append("text")
    .attr("x", (width / 2))
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .attr("font-weight", "bold")
    .text(title)

  const xScale = d3.scaleTime()
    .domain([d3.min(data, d => d.Time), d3.max(data, d => d.Time)])   // Time range - old -> .domain(d3.extent(data, d => d.Time))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, Math.ceil(maxValue)])  // Round the highest reading up to nearest integer
    .range([height, 0]);

  console.log("x domain:", d3.min(data, d => d.Time), d3.max(data, d => d.Time));
  console.log("y domain:", 0, Math.ceil(d3.max(data, d => d[metric])));

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
    .ticks(5);  // Ticks need further configuration
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
    .text(date);  // Make this dynamic

  // Add label y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -height / 2)
    .style("text-anchor", "middle")
    .text(metric)

  const myLine = d3.line()
    .x(d => xScale(d.Time))
    .y(d => yScale(d[metric]))
    .curve(d3.curveCardinal);
  
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .attr("d", myLine);
}


const LineGraph = ({ device }) => {
  useEffect(() => {
    // const svg = d3.select(svgRef.current);
    d3.csv(`/api/site-data/${device}`).then(function (data) { 

      // Change number strings to numbers
      data.forEach(d => {
        d.Time = new Date(d.Time);
        d.Pressure = +d.Pressure; // + prepended converts a string to a number
        d.Flow = +d.Flow;
      })

      // Remove any svg elements from the dom or page?
      d3.selectAll("svg").remove();
      
      createGraph(data, "pressure-container", "Pressure", "Pressure");
      createGraph(data, "flow-container", "Flow", "Flow");

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