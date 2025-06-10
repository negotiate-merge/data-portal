import React, { useEffect, } from 'react';
import * as d3 from 'd3';
import { timeFormat } from 'd3'; 


const createGraph = (data, containerId, metric, title, color="steelblue") => {
  const margin = { top: 50, right: 30, bottom: 50, left: 40 }; // bottom previously 55
  const width = 800 - margin.left - margin.right;
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
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .attr("class", "graph")
    .style("max-width", "100%")
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

  /* X AXIS */
  const x = d3.scaleTime()
    .domain([d3.min(data, d => d.Time), d3.max(data, d => d.Time)])   // Time range - old -> .domain(d3.extent(data, d => d.Time))
    .range([0, width]);

  const xAxis = d3.axisBottom(x)
    .ticks(data.length)
    .tickValues(x.ticks(d3.timeHour.every(1)))
    .tickFormat(d3.timeFormat("%I %p"));

  svg
    .append("g")
    .attr("class", "x-axis")  // .select(".x-axis")
    .attr("transform", `translate(0,${height})`) // .style("transform", `translateY(${height}px)`)
    .call(xAxis)
    .call(g => g.select(".domain").remove())
    .selectAll(".tick line")
    .style("stroke-opacity", 0)
  svg.selectAll(".tick text")
    .attr("fill", "#000");

  // Add labels x axis
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .style("text-anchor", "middle")
    .text(date);

  /* Y AXIS */

  const y = d3.scaleLinear()
    .domain([0, Math.ceil(maxValue)])  // Round the highest reading up to nearest integer
    .range([height, 0]);

  const yAxis = d3.axisLeft(y)
    .ticks(Math.ceil(maxValue))
    .tickFormat(d => d.toFixed(0))
    .tickSize(0)
    .tickPadding(10)
  svg.append("g")
    //.style("transform", "translateX(0px)")
    .call(yAxis)
    .call(g => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#000")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) { return "hidden"; }
      else { return "visible"; }
    });

  const yLabel = () => {
    if (metric === "Pressure") return `${metric} psi`;
    if (metric === "Flow") return `${metric} m3/s`;
  }

  // Add vertical gridlines
  svg.selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#9e0573")
    .attr("stroke-width", .5);

  // Add horizontal gridlines
  svg.selectAll("yGrid")
    .data((maxValue < 3) ? [1, 2, 3] : y.ticks(maxValue).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d))
    .attr("stroke", "#9e0573") //#e0e0e0
    .attr("stroke-width", .5);

  // Add label y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -height / 2)
    .style("text-anchor", "middle")
    .text(yLabel)

  const myLine = d3.line()
    .x(d => x(d.Time))
    .y(d => y(d[metric]))
    .curve(d3.curveCardinal);
  
  // Add the line path
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .attr("d", myLine);


  /* TOOL TIP */
  // Create tooltip div
  const svgContainer = d3.select(`#${containerId}`)
    .style("position", "relative");
  
  svgContainer.select(".d3-tooltip").remove();
  const tooltip = svgContainer
    .append("div")
    .attr("class", "d3-tooltip");

  // Add circle element
  const circle = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("stroke", "white")
    .attr("opacity", .70)
    .style("pointer-events", "none");

  const listeningRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height);

  listeningRect.on("mousemove", function (event) {
    const [xCoord] = d3.pointer(event, this);
    const bisectTime = d3.bisector(d => d.Time).left;
    const x0 = x.invert(xCoord);
    const i = bisectTime(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.Time > d1.Time - x0 ? d1 : d0;
    const xPos = x(d.Time);
    const yPos = y(d[metric]);
  
  // Update the circle position
  circle.attr("cx", xPos)
    .attr("cy", yPos);
  
  // Add transition for the circle radius
  circle.transition()
    .duration(50)
    .attr("r", 5);

  // Add in our tooltip
  tooltip
    .style("display", "block")
    .style("left", `${xPos + 100}px`)
    .style("top", `${yPos + 50}px`)
    .html(`<strong>Time:</strong> ${d.Time.toLocaleTimeString("en-US")}<br><strong>${metric}:</strong> ${d[metric] !== undefined ? (d[metric]).toFixed(2) + (metric === "Pressure" ? "Psi" : "m3/s") : 'N/A'}`);
  });

  // Listening rectangle mouse leave function
  listeningRect.on("mouseleave", function () {
    circle.transition()
      .duration(50)
      .attr("r", 0);

    tooltip.style("display", "none");
  })

}


const LineGraph = ({ device }) => {
  useEffect(() => {
    // const svg = d3.select(svgRef.current);
    d3.csv(`/api/site-data/${device}`).then(function (data) { 

      const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S")
      
      // Change number strings to numbers
      data.forEach(d => {
        d.Time = parseDate(d.Time);//new Date(d.Time);
        d.Pressure = +d.Pressure * 2.9; // 14.5(psi) / 5 = 2.9 as a ratio of volts to psi
        d.Flow = +d.Flow * 0.6;         // 3 m3/s / 5 = 0.6 as a ratio of volts to m3/s
      })

      // Remove any svg elements from the dom or page?
      d3.selectAll("svg").remove();
      createGraph(data, "pressure-container", "Pressure", "Pressure");
      createGraph(data, "flow-container", "Flow", "Flow");

      const containers = document.getElementsByClassName("container");
      for (let i=0; i<containers.length; i++) {
        if (containers[i].closest('nav')) continue; // Skip container class in nav
        containers[i].classList.add("g-container");
        containers[i].classList.remove("container");
      }

    })
  }, []); // Removed data as a dependency

  return (
    <>
      <div id="pressure-container" className='s-card'></div>
      <div id="flow-container" className='s-card'></div>
    </>
  )
}

export default LineGraph;