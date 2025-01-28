import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LineGraph = ({ device }) => {
  // const [data, setData] = useState([25, 30, 45, 60, 20, 65, 70]); 
  const svgRef = useRef();
  const width = 1200;
  const height = 500;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    d3.csv(`/site-data/${device}`).then(function (data) {

      // Change number strings to numbers
      data.forEach(d => {
        d.Time = new Date(d.Time);
        d.Pressure = +d.Pressure;
        d.Flow = +d.Flow;
      })

      const minPressure = d3.min(data, d => d.Pressure);
      const maxPressure = d3.max(data, d => d.Pressure);
      console.log(`min Pressure ${minPressure}, max Pressure ${maxPressure}`)

      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Time))   // Time range
        .range([0, width]);

      /* Old version for reference in case of catastrophic failure
      const xScale = d3.scaleLinear()
      .domain([0, data.length -1])
      .range([0, width]);
      */

      const yScale = d3.scaleLinear()
        .domain([0, Math.ceil(maxPressure)])  // Round the highest reading up to nearest integer
        .range([height, 0]);

      try {
        const xAxis = d3.axisBottom(xScale)
          .ticks(data.length)
          .tickFormat(d3.timeFormat("%H:%M")); // TODO Extract and use time here
        svg
          .select(".x-axis")
          .attr("transform", `translate(0,${height})`) // .style("transform", `translateY(${height}px)`)
          .call(xAxis)
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");
      } catch (e) {
        console.error(e);
      } 

      const yAxis = d3.axisLeft(yScale)
        .ticks(5);
      svg
        .select(".y-axis")
        .style("transform", "translateX(0px)")
        .call(yAxis);

      // Add labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 10)
        .style("text-anchor", "middle")
        .text("Time");

      // This Label does not show, not important at this point
      svg.append("Text")
        .attr("transform", "rotate(-90)")
        .attr("y", 15)
        .attr("x", height / 2)
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

      /* Obselete but saved from working past version for reference
      svg
        .selectAll("circle")
        .data([data])
        .join("path")
        .attr("d", myLine)
        .attr("fill", "none")
        .attr("stroke", "blue")
      */

    })
    
    /* Draws circles on the svg area
    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("r", value => value)
      .attr("cx", value => value * 2)
      .attr("cy", value => value * 2)
      .attr("stroke", "red")
    */
  }, []); // Removed data as a dependency

  return (
    <React.Fragment>
      <svg ref={svgRef} width="1200" height="500">
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
      <br />
      <br />
      <br />
    </React.Fragment>
  )

  

}

export default LineGraph;


  /*

  useEffect(() => {
    if (!device || device.length === 0) return;
        // Set up dimensions
    const margin = { top: 70, right: 30, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Set up the x and y scales
    const x = d3.scaleTime().range([0, innerWidth]);
    const y = d3.scaleLinear().range([innerHeight, 0]);

    const svg = d3
      .select(svgRef.current)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load and process data
    d3.csv(`${device}.csv`).then(function (data) {
    
      
      // Parse the date and convert the population to a number
      const parseDate = d3.timeParse("%Y/%m/%d %H:%M:%S");
      // const data = data.data;
      data.forEach(d => {
        d.date = parseDate(d.date);
        d.pressure = +d.pressure;
        d.flow = +d.flow;
      });

      console.log("data is:", data);

      // Define the x and y domains
      x.domain(d3.extent(data, d => d.date));
      y.domain([75000, d3.max(data, d => d.pressure)]);

      // Add the x-axis
      svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .style("font-size", "14px")
        .call(d3.axisBottom(x)  // the following two lines need attention
          .tickValues(x.ticks(d3.timeMinutes(d3.min(data, d => d.date), d3.max(data, d => d.date))))
          .tickFormat(d3.timeFormat("%b %Y")))
        .call(g => g.select(".domain").remove())
        .selectAll(".tick line")
        .style("stroke-opacity", 0)
      svg.selectAll(".tick text")
        .attr("fill", "#777");

      // Add the y axis
      svg.append("g")
        .style("font-size", "14px")
        .call(d3.axisLeft(y)
          .ticks((d3.max(data, d => d.pressure)))
          .tickFormat(d => {
            return `${d}`;  // removed (d / 1000).toFixed(0) k
          })
          .tickSize(0)
          .tickPadding(10))
        .call(g => g.select(".domain").remove())
        .selectAll(".tick text")
        .style("fill", "#777")
        .style("visibility", (d, i, nodes) => {
          if (i === 0) {
            return "hidden";
          } else {
            return "visible";
          }
        });

      // Add vertical grid lines
      svg.selectAll("xGrid")
        .data(x.ticks().slice(1))
        .join("line")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", .5);


      // Add horiaontal grid lines
      svg.selectAll("yGrid")
        .data(y.ticks((d3.max(data, d => d.pressure)))) // Might need to adjust a simlar call above with this
        .join("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", .5)

      // Add Y=axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (innerHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14ps")
        .style("fill", "#777")
        .style("font-family", "sans-serif")
        .text("Sewer Pressure");

      // Add a chart title
      svg.append("text")
        .attr("class", "chart-title")
        .attr("x", margin.left - 100)
        .attr("y", margin.top - 100)
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .text(`Sewer pressure for ${data.siteName} site with devID: ${data.devId}`);


      // Create the line generator
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.pressure));

      // Add the line path to the SVG element
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("d", line);
    }, )
    }, [device, width, height]);

  return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
      />
    )
};

export default LineGraph;

*/