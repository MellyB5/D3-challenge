var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
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
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function yScale(popData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(popData, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;

}

function xScale(popData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(popData, d => d[chosenXAxis]) * 0.8,
        d3.max(popData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    console.log(chosenXAxis);
    console.log(circlesGroup);

    var label;

    if (chosenXAxis === "poverty") {
        label = "In Poverty (%)";
    }
    else {
        label = "Age (median)";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            console.log(d);
            return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (popData, err) {
    if (err) throw err;

    // parse data
    popData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(popData, chosenXAxis);
    var bottomAxis = d3.axisBottom(xLinearScale);
    console.log(chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(popData, chosenYAxis);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g").attr("class", "y_text")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(popData)
        .enter();

    circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "lightblue")
        .attr("opacity", ".5");
    circlesGroup.append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis])-10)
        .attr("y", d => yLinearScale(d[chosenYAxis])+3)
        .attr("class", "state_text")
        .text(d=> d.abbr);

    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .attr("data-target", "x")
        .attr("data-value", "poverty")
        .classed("active", true)
        .text("Poverty");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .attr("data-target", "x")
        .attr("data-value", "age")
        .classed("inactive", true)
        .text("Age");
    var yLabelsGroup = chartGroup.select(".y_text")

    // append y axis
    yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("data-target", "y")
        .attr("data-value", "smokes")
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", true)
        .text("Smokes");

        yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("data-target", "y")
        .attr("value", "healthcare")
        .attr("data-value", "healthcare")
        .classed("inactive", true)
        .text("Healthcare");

    // updateToolTip function above csv import
    // var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("data-value");
            var target = d3.select(this).attr("data-target");
            console.log(value);
            // var yValue = d3.select(this).attr("yValue");
            if (target==="x" && value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(popData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                chartGroup.selectAll("circle").each(function(){
                    d3.select(this)
                    .transition()
                    .attr("cx", d=>xLinearScale(d[chosenXAxis]))
                    .duration(400)
                });
                chartGroup.selectAll(".state_text").each(function(){
                    d3.select(this)
                    .transition()
                    .attr("x", d => xLinearScale(d[chosenXAxis])-10)
                    // .attr("y", d => yLinearScale(d[chosenYAxis])+3)
                    .duration(400)
                });

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }

        });
        yLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("data-value");
            var target = d3.select(this).attr("data-target");
            console.log(value);
            // var yValue = d3.select(this).attr("yValue");
            if (target==="y" && value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(popData, chosenYAxis);
       
        
                // updates x axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x values
                // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                chartGroup.selectAll("circle").each(function(){
                    d3.select(this)
                    .transition()
                    .attr("cx", d=>xLinearScale(d[chosenXAxis]))
                    .attr("cy", d=>yLinearScale(d[chosenYAxis]))
                    .duration(400)
                });
                chartGroup.selectAll(".state_text").each(function(){
                    d3.select(this)
                    .transition()
                    .attr("x", d => xLinearScale(d[chosenXAxis])-10)
                    .attr("y", d => yLinearScale(d[chosenYAxis])+3)
                    .duration(400)
                });

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
})
// .catch(function (error) {
//     console.log(error);
// });
