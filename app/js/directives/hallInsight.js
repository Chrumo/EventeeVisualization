/**
 * Created by tomas on 26.11.16.
 */
angular.module('diploma')
    .directive('hallInsight', [
        '$log',
        '$window',
        'filterService',
        function ($log, $window, filterService) {
            return {
                restrict: 'E',
                scope: {
                    data: '=',
                    maxVal: '=',
                    start: '=',
                    end: '=',
                    refresh: '=',
                    click: "&ngClick"
                },
                link: function (scope, element) {
                    var w = $(element[0]).parent().width();
                    var h = 100;
                    var padding = 25;

                    var xScale = d3.time.scale()
                        .domain([scope.start.toDate(), scope.end.toDate()])
                        .range([padding, w - padding]);

                    var yScale = d3.scale.linear()
                        .domain([0, +scope.maxVal])
                        .range([h - padding, padding]);

                    //Define X axis
                    var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .ticks(d3.time.hour, 2)
                        .tickFormat(d3.time.format("%H:%M"));

                    //Define Y axis
                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .ticks(2);

                    //Define key function, to be used when binding data
                    var key = function (d) {
                        return d.id;
                    };

                    var elem = $window.d3.select(element[0]);

                    //Create SVG element
                    var svg = elem
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

                    //Create X axis
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (h - padding) + ")")
                        .call(xAxis);

                    //Create Y axis
                    svg.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + padding + ",0)")
                        .call(yAxis);

                    // on hover text
                    var text = svg.append("text")
                        .text("0")
                        .attr("text-anchor", "middle")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "#666666")
                        .attr("class", "hidden")
                        .style("pointer-events", "none");

                    /****************************************************** RENDER ******************************************************/
                    scope.render = function (dataset) {
                        if (dataset === undefined) {
                            return;
                        }

                        dataset.forEach(function (d) {
                            if (moment.isMoment(d.start) && moment.isMoment(d.end)) {
                                d.start = d.start.toDate();
                                d.end = d.end.toDate();
                            }
                            d.value = +d.value;
                        });

                        //Update scale domains
                        xScale.domain([scope.start.toDate(), scope.end.toDate()]);
                        yScale.domain([0, +scope.maxVal]);

                        //Select…
                        var bars = svg.selectAll(".hall-insight-bars")
                            .data(dataset, key);

                        //Enter…
                        bars.enter()
                            .append("rect")
                            .attr("x", function (d) {
                                return xScale(d.start);
                            })
                            .attr("y", function (d) {
                                return yScale(d.value);
                            })
                            .attr("width", function (d) {
                                return xScale(d.end) - xScale(d.start);
                            })
                            .attr("height", function (d) {
                                return h - padding - yScale(d.value);
                            })
                            .attr("id", function (d) {
                                return "lecture_" + d.id;
                            })
                            .attr("class", "hall-insight-bars")
                            .classed("chosen", function (d) {
                                return filterService.isLectureSelected(d.id);
                            });

                        // Update
                        bars.classed("chosen", function (d) {
                            return filterService.isLectureSelected(d.id);
                        });


                        //Dashed borders and on hover events
                        var invisibleBars = svg.selectAll(".hall-insight-invisible-bars")
                            .data(dataset, key);

                        //Enter…
                        invisibleBars.enter()
                            .append("rect")
                            .attr("x", function (d) {
                                return xScale(d.start);
                            })
                            .attr("y", function () {
                                return padding;
                            })
                            .attr("width", function (d) {
                                return xScale(d.end) - xScale(d.start);
                            })
                            .attr("height", function () {
                                return h - 2 * padding;
                            })
                            .attr("class", "hall-insight-invisible-bars")
                            .on("click", function (d) {
                                if (angular.isFunction(scope.click)) {
                                    scope.click()(d.id);
                                    scope.render(angular.copy(scope.data));
                                }
                            })
                            .on("mouseover", function (d) {
                                d3.select("#lecture_" + d.id)
                                    .classed("active", true);
                                text.text(d.value)
                                // text.text(d.id)
                                    .attr("text-anchor", "middle")
                                    .attr("x", (xScale(d.start) + xScale(d.end)) / 2)
                                    .attr("y", 25)
                                    .classed("hidden", false);
                            })
                            .on("mouseout", function (d) {
                                d3.select("#lecture_" + d.id)
                                    .classed("active", false);
                                text.classed("hidden", true);
                            })
                            .classed("chosen", function (d) {
                                return filterService.isLectureSelected(d.id);
                            });

                        // Update
                        invisibleBars.classed("chosen", function (d) {
                            return filterService.isLectureSelected(d.id);
                        });

                        //Update X axis
                        svg.select(".x.axis")
                            .transition()
                            .duration(1000)
                            .call(xAxis);

                        //Update Y axis
                        svg.select(".y.axis")
                            .transition()
                            .duration(1000)
                            .call(yAxis);
                    };

                    scope.$watchGroup(['data', 'maxVal', 'start', 'end', 'refresh'], function () {
                        scope.render(angular.copy(scope.data));
                    });
                }
            };
        }]);