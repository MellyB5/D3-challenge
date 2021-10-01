var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 40,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 20);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(popData, chosenXAxis){
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(popData, d => d[chosenXAxis]) * 0.8,
        d3.max(popData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}

// function used for updating y-scale var upon click on axis label
function yScale(popData, chosenYAxis){
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(popData, d => d[chosenYAxis])-2,d3.max(popData, d => d[chosenYAxis])+2])
      .range([height, 0]);
  
    return yLinearScale;
  
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(500)
      .call(bottomAxis);
  
    return xAxis;
}

// update yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis){
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(500)
      .call(leftAxis);
  
    return yAxis;
}

// update circles group with a transition to
// new circles for x-axis
function renderXCircles(circlesGroup, newXScale, chosenXAxis){

    circlesGroup.transition()
      .duration(500)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}
// new circles for y-axis
function renderYCircles(circlesGroup, newYScale, chosenYAxis){

    circlesGroup.transition()
      .duration(500)
      .attr("cy", d => newYScale(d[chosenYAxis]))
      .attr("dy", d => newYScale(d[chosenYAxis])+5)
  
    return circlesGroup;
}
// Update text location
function renderXText(circlesGroup, newXScale, chosenXAxis){

    circlesGroup.transition()
      .duration(500)
      .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}
function renderYText(circlesGroup, newYScale, chosenYAxis){

    circlesGroup.transition()
      .duration(500)
      .attr("dy", d => newYScale(d[chosenYAxis])+5)
  
    return circlesGroup;
}

// update circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup){

    var xlabel;
    var ylabel;
  
    if (chosenXAxis === "poverty"){
      xlabel = "In Poverty (%)";
    }
    else if (chosenXAxis === "age"){
      xlabel = "Age (median in years)";
    }
    else if (chosenXAxis === "income"){
        xlabel = "Household income (median in $)"
    }

    if (chosenYAxis === 'healthcare'){
        ylabel = "Lacks Healthcare (%)"
    }
    else if (chosenYAxis === 'obesity'){
        ylabel = "Obese (%)"
    }
    else if (chosenYAxis === 'smokes'){
        ylabel = "Smokes (%)"
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([100, 100])
      .style("color", "black")
      .style("background", 'white')
      .style("border", "solid")
      .style("border-color", "red")
      .style("border-width", "5px")
      .style("border-radius", "10px")
      .style("padding", "5px")
      .html(function(d) {
        return (`<strong>${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}</strong>`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data){
      toolTip.show(data);
    })
      
    .on("mouseout", function(data, index){
    toolTip.hide(data);
    });
  
    return circlesGroup;
}

// Retrieve data and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err){
    if (err) throw err;
  
    // parse data to integer
    data.forEach(d => {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.healthcare = +d.healthcare;
      d.obesity = +d.obesity;
      d.smokes = +d.smokes;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = yScale(data, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("g");

    var circles = circlesGroup.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 15)
      .classed('stateCircle', true);

    // append text for circles
    var circlesText = circlesGroup.append("text")
      .text(d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      //to center the text in the circles
      .attr("dy", d => yLinearScale(d[chosenYAxis])+5)
      .classed('stateText', true);
  
    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var Poverty = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var Age = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var Income = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
    
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")
    
    var Obese = ylabelsGroup.append("text")
      .attr("y", -80)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");
  
    var Smokes = ylabelsGroup.append("text")
      .attr("y", -60)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var Health = ylabelsGroup.append("text")
      .attr("y", -40)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    // updateToolTip
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replace chosenXAxis with value
          chosenXAxis = value;
  
          // update x scale for new data
          xLinearScale = xScale(data, chosenXAxis);
  
          // update x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // update circles with new x values
          circles = renderXCircles(circles, xLinearScale, chosenXAxis);

        //   update text within circles
          circlesText = renderXText(circlesText, xLinearScale, chosenXAxis)  
  
          // update tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes class to change bold text
          if (chosenXAxis === "age"){
            Age
              .classed("active", true)
              .classed("inactive", false);
            Poverty
              .classed("active", false)
              .classed("inactive", true);
            Income
              .classed("active", false)
              .classed("inactive", true);
          }
          else if(chosenXAxis === 'income'){
            Income
              .classed("active", true)
              .classed("inactive", false);
            Poverty
              .classed("active", false)
              .classed("inactive", true);
            Age
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            Income
              .classed("active", false)
              .classed("inactive", true);
            Age
              .classed("active", false)
              .classed("inactive", true);
            Poverty
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

      // y axis labels event listener
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replace chosenYAxis with value
        chosenYAxis = value;

        // update y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // update x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // update circles with new y values
        circles = renderYCircles(circles, yLinearScale, chosenYAxis);

        // update text within circles
        circlesText = renderYText(circlesText, yLinearScale, chosenYAxis) 

        // update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes class to change bold text
        if (chosenYAxis === "obesity"){
          Obese
            .classed("active", true)
            .classed("inactive", false);
          Smokes
            .classed("active", false)
            .classed("inactive", true);
          Health
            .classed("active", false)
            .classed("inactive", true);
        }
        else if(chosenYAxis === 'smokes'){
          Smokes
            .classed("active", true)
            .classed("inactive", false);
          Health
            .classed("active", false)
            .classed("inactive", true);
          Obese
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          Health
            .classed("active", true)
            .classed("inactive", false);
          Smokes
            .classed("active", false)
            .classed("inactive", true);
          Obese
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
  }).catch(function(error){
    console.log(error);
  });