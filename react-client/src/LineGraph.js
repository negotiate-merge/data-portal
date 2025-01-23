import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineGraph = ({ data, width = 1200, height = 500 }) => {
  
  
  const svgRef = useRef();

  useEffect(() => {
    // if (!data || data.length === 0) return;

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
    d3.csv(`${process.env.PUBLIC_URL}/dummy_data.csv`).then(function (data) {
      
      // Parse the date and convert the population to a number
      const parseDate = d3.timeParse("%Y-%m-%d");
      data.forEach(d => {
        d.date = parseDate(d.date);
        d.population = +d.population;
      });

      console.log(data);
      // Define the x and y domains
      x.domain(d3.extent(data, d => d.date));
      y.domain([75000, d3.max(data, d => d.population)]);

      // Add the x-axis
      svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .style("font-size", "14px")
        .call(d3.axisBottom(x)
          .tickValues(x.ticks(d3.timeMonth.every(6)))
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
          .ticks((d3.max(data, d => d.population) - 65000) / 5000)
          .tickFormat(d => {
            return `${(d / 1000).toFixed(0)}k`;
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
        .data(y.ticks((d3.max(data, d => d.population) - 65000) / 5000).slice(1))
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
        .text("Total Population");

      // Add a chart title
      svg.append("text")
        .attr("class", "chart-title")
        .attr("x", margin.left - 100)
        .attr("y", margin.top - 100)
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .text("Prison Populations in the US Have Trended Upwards Since Summer 2020")


      // Create the line generator
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.population));

      // Add the line path to the SVG element
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("d", line);

      })
    }, [data, width, height]);

  return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
      />
    )
};

export default LineGraph;
