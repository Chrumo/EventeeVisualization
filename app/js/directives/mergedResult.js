/**
 * Created by tomas on 26.11.16.
 */
angular.module('diploma')
    .directive('mergedResult', [
        '$log',
        '$window',
        function ($log, $window) {
            return {
                restrict: 'E',
                scope: {
                    data: '='
                },
                link: function (scope, element) {
                    var w = 850;
                    var h = 400;
                    var padding = 30;

                    const getMinTime = function() {
                        var minTime = moment().add(100, 'y');
                        angular.forEach(scope.data, function (lecture) {
                            if(lecture.start.isBefore(minTime)) {
                                minTime = lecture.start;
                            }
                        });
                        return minTime;
                    };

                    const getMaxTime = function() {
                        var maxTime = moment().subtract(100, 'y');
                        angular.forEach(scope.data, function (lecture) {
                            if(lecture.end.isAfter(maxTime)) {
                                maxTime = lecture.end.clone();
                            }
                            angular.forEach(lecture.data, function(rating) {
                                if(rating.datetime.isAfter(maxTime)) {
                                    maxTime = rating.datetime.clone();
                                }
                            });
                        });
                        return maxTime;
                    };

                    const getTicks = function() {
                        const s = getMinTime().clone();
                        const e = getMaxTime().clone();
                        var tick = {
                            'unit': d3.time.minute,
                            'count': 0,
                            'format': d3.time.format("%H")
                        };
                        if(e.diff(s, 'days') > 4) {
                            tick.unit = d3.time.day;
                            tick.count = Math.ceil(e.diff(s, 'days') / 3);
                            tick.format = d3.time.format("%b %d")
                        } else if(e.diff(s, 'days') > 2) {
                            tick.unit = d3.time.day;
                            tick.count = 1;
                            tick.format = d3.time.format("%b %d")
                        } else if(e.diff(s, 'days') > 0) {
                            tick.unit = d3.time.hour;
                            tick.count = 12;
                            tick.format = d3.time.format("%H")
                        } else if(e.diff(s, 'hours') > 12) {
                            tick.unit = d3.time.hour;
                            tick.count = 6;
                            tick.format = d3.time.format("%H")
                        } else if(e.diff(s, 'minutes') < 30) {
                            tick.unit = d3.time.minute;
                            tick.count = 5;
                            tick.format = d3.time.format("%H:%M")
                        } else {
                            tick.unit = d3.time.hour;
                            tick.count = 3;
                            tick.format = d3.time.format("%H")
                        }
                        return tick;
                    };

                    var xScale = d3.time.scale()
                        .domain([getMinTime().toDate(), getMaxTime().toDate()])
                        .range([padding, w - padding]);

                    var yScale = d3.scale.linear()
                        .domain([0, 1])
                        .range([h - padding, padding]);

                    var colorScaleA = d3.scale.category20();
                    var colorScaleB = d3.scale.category20b();
                    var colorScaleC = d3.scale.category20c();

                    //Define X axis
                    var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .ticks(d3.time.months, 1);

                    //Define Y axis
                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .ticks(2);

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

                    //Define key function, to be used when binding data
                    var key = function(d) {
                        return d.id;
                    };

                    /****************************************************** RENDER ******************************************************/
                    scope.render = function (dataset) {
                        if (dataset === undefined) {
                            return;
                        }

                        dataset.forEach(function (d) {
                            if (moment.isMoment(d.start)) {
                                d.start = d.start.toDate();
                            }
                            if (moment.isMoment(d.end)) {
                                d.end = d.end.toDate();
                            }
                            angular.forEach(d.data, function(rating) {
                                if (moment.isMoment(rating.datetime)) {
                                    rating.datetime = rating.datetime.toDate();
                                }
                                rating.value = +rating.value;
                            });
                        });

                        //Update scale domains
                        xScale.domain([getMinTime(), getMaxTime().toDate()]);
                        yScale.domain([0, d3.max(dataset, function(d) {
                            return d3.max(d.data, function(rating) {
                                return rating.value;
                            });
                        })]);

                        //Select…
                        // var lines = svg.selectAll(".lecture-multiple-line")
                        //     .data(dataset, key);
                        //
                        // //Enter…
                        // lines.enter()
                        //     .append("line")
                        //     .attr("x1", function (d) {
                        //         return xScale(d.datetime);
                        //     })
                        //     .attr("y1", h - padding)
                        //     .attr("x2", function (d) {
                        //         return xScale(d.datetime);
                        //     })
                        //     .attr("y2", padding)
                        //     .attr("class", "lecture-multiple-line")
                        //     .attr("stroke-width", 2)
                        //     .on('mouseover', function (d) {
                        //         d3.select("circle")
                        //             .attr("cx", xScale(d.datetime))
                        //             .attr("cy", yScale(d.value))
                        //             .attr("fill", "rgba(47, 100, 89, 1)"); // #2f6459
                        //     })
                        //     .on('mouseout', function (d) {
                        //         d3.select("circle")
                        //             .transition('circle-' + key(d) + '-mouseout')
                        //             .duration(10)
                        //             .attr("fill", "rgba(0, 0, 0, 0)");
                        //     });

                        var line = d3.svg.line()
                            .x(function(d) { return xScale(d.datetime); })
                            .y(function(d) { return yScale(d.value); });

                        svg.selectAll('.merged-result-path')
                            .data(dataset, key)
                            .enter().append("path")
                            .attr("class", "merged-result-path")
                            .attr("stroke-width", 1.5)
                            .style("opacity", "0.5")
                            .attr("d", function(d) {
                                return line(d.data);
                            })
                            .attr("stroke", function (d, i) {
                                if(i < 20) {
                                    return colorScaleA(i);
                                } else if(i < 40) {
                                    return colorScaleB(i);
                                } else {
                                    return colorScaleC(i);
                                }
                            })
                            .on("mouseover", function() {
                                d3.select(this)
                                    .style("opacity", "1")
                                    .attr("stroke-width", 3.5);
                            })
                            .on("mouseout", function() {
                                d3.select(this)
                                    .style("opacity", "0.5")
                                    .attr("stroke-width", 1.5);
                            });

                        // on hover tip
                        // svg.append("circle")
                        //     .attr("cx", 0)
                        //     .attr("cy", 0)
                        //     .attr("r", 3)
                        //     .attr("fill", "rgba(0, 0, 0, 0)");

                        //Update X axis
                        ticks = getTicks();
                        svg.select(".x.axis")
                            .transition('x-axis')
                            .duration(1000)
                            .call(xAxis
                                    .ticks(ticks.unit, ticks.count)
                                    .tickFormat(ticks.format)
                            );

                        //Update Y axis
                        svg.select(".y.axis")
                            .transition('y-axis')
                            .duration(1000)
                            .call(yAxis);
                    };

                    scope.$watchGroup('data', function () {
                        scope.render(angular.copy(scope.data));
                    });
                }
            };
        }]);