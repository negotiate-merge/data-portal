import * as d3 from 'd3';
import { timeFormat } from 'd3'; 

const createGraph = (data, containerId, metric, title, color="steelblue") => {
  const isMobile = window.innerWidth < 768;

  // console.log('data from createGraph:', data);

  if (data.length <= 1) {
    const messageContainer = d3.select(`#${containerId}`);
    messageContainer.selectAll('*').remove();
    messageContainer.
      html(`<p class="no-data">No ${metric} data available yet for this date</p>`);
    return
  }

  const margin = { top: 50, right: 30, bottom: 50, left: 40 };
  const width = ((isMobile) ? 800 : window.innerWidth - 20) - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const maxValue = d3.max(data, d => d[metric]);
  const formatDate = timeFormat("%d %B %Y");
  const maxDate = formatDate(d3.max(data, d => d.Time));
  const minDate = formatDate(d3.min(data, d => d.Time));

  // Clear previous SVG if present
  d3.select(`#${containerId}`).select('svg').remove();

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

  /* x AXIS */
  const x = d3.scaleTime()
    .domain([d3.min(data, d => d.Time), d3.max(data, d => d.Time)])
    .range([0, width]);

  const xAxis = d3.axisBottom(x)
    .ticks(data.length)
    .tickValues(x.ticks(d3.timeHour.every((data.length > 96) ? 6 : 1)))
    .tickFormat(d3.timeFormat("%I %p"));

  svg
    .append("g")
    .attr("class", "x-axis")  // .select(".x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .call(g => g.select(".domain").remove())
    .selectAll(".tick line")
    .style("stroke-opacity", 0) // remove tick lines at axis
  
  svg.selectAll(".tick text").attr("fill", "#000");

  // Add labels x axis
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .style("text-anchor", "middle")
    .text((data.length > 96) ? `${minDate} - ${maxDate}` : maxDate);
  

  /* Y AXIS */
  const yMax = Math.ceil(maxValue * 2 / 2)  // Round the highest reading up to nearest integer
  const y = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

  // Ticks for flow in 0.5 increments
  const ticks = [];
  for (let i=0; i<=yMax; i+=0.5) {ticks.push(i);}

  const yTicks = metric === "Flow" ? ticks.slice(0, -1) :
    d3.range(0, Math.ceil(maxValue), 1); // 

  const yAxis = d3.axisLeft(y)
    .tickValues(yTicks)
    .tickFormat(d => (d % 1) ? d.toFixed(1) : d.toFixed(0)) // Exclude floating point if appropriate
    .tickSize(0)
    .tickPadding(10)

  svg.append("g")
    .call(yAxis)
    .call(g => g.select(".domain").remove())
    .selectAll(".tick text")
    .style("fill", "#000")
    .style("visibility", (d, i, nodes) => {
      if (i === 0) { return "hidden"; } // Hide 0 @ x y axis origin
      else { return "visible"; }
    });

  const yLabel = () => {
    if (metric === "Pressure") return `psi`;
    if (metric === "Flow") return `m³/s`;
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
    .data((maxValue <= 3) ? ticks.slice(1, -1) : y.ticks(maxValue).slice(1, -1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d))
    .attr("stroke", "#9e0573")
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


  /* TOOL TIPS */
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
    .attr("height", height)
    .attr("fill", "transparent")
    .style("pointer-events", "all");
    

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
    circle.transition().duration(50).attr("r", 5);

    const containerBounds = svgContainer.node().getBoundingClientRect();    // Get container offset
    const mouseX = event.clientX - containerBounds.left;   // Get mouse co-ords
    const mouseY = event.clientY - containerBounds.top;

    // Show tooltip temporarily to measure its dimensions
    tooltip
      .style("visibility", "hidden")
      .style("display", "block")
      .html(`<strong>Time:</strong> ${d.Time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}<br><strong>${metric}:</strong> ${d[metric] !== undefined ? (d[metric]).toFixed(1) + (metric === "Pressure" ? " Psi" : " m3/s") : 'N/A'}`)

    const toolTipWidth = tooltip.node().offsetWidth;    // get tooltip width
    const toolTipHeight = tooltip.node().offsetHeight;  // get tooltip height
    const padding = 15;

    let toolTipPosX;
    if (mouseX + toolTipWidth + padding > containerBounds.width) {
      toolTipPosX = mouseX - toolTipWidth - padding;  // place on left of cursor if overflowing to the right
    } else {
      toolTipPosX = mouseX + padding;
    }

    let toolTipPosY = mouseY - toolTipHeight - padding;
    if (toolTipPosY < 0) {
      toolTipPosY = mouseY + padding; // Prevent overflow at top
    }

    if (toolTipPosY + toolTipHeight > containerBounds.height) {
      toolTipPosY = containerBounds.height - toolTipHeight - padding; // Prevent overflow below
    }

    // Position and make visible
    tooltip
      .style("left", `${toolTipPosX}px`)
      .style("top", `${toolTipPosY}px`)
      .style("visibility", "visible");
  });

  // Listening rectangle mouse leave function
  listeningRect.on("mouseleave", function () {
    circle.transition()
      .duration(50)
      .attr("r", 0);
    tooltip
      .style("visibility", "hidden")
      .style("display", "none");
  });
};

export default createGraph;