/**
 * Directive representing lecture multiple visualization.
 * Created by tomas on 26.11.16.
 */
angular.module('diploma')
    .directive('lectureMultiple', [
        '$log',
        '$window',
        function ($log, $window) {
            return {
                restrict: 'E',
                scope: {
                    data: '=',
                    name: '=',
                    start: '=',
                    end: '='
                },
                link: function (scope, element) {
                    var w = 200;
                    var h = 75;
                    var padding = 25;

                    /**
                     * Return maximal time from all lectures ends and theirs ratings.
                     * @return {Moment}
                     */
                    const getMaxTime = function() {
                        var maxTime = scope.end.clone();
                        angular.forEach(scope.data, function (rating) {
                            if(rating.datetime.isAfter(maxTime)) {
                                maxTime = rating.datetime.clone();
                            }
                        });
                        return maxTime;
                    };

                    /**
                     * Return tics distribution and format based on visualization duration.
                     * @return {{unit: (((m:number)=>Moment)|(()=>number)|number|*), count: number, format}}
                     */
                    const getTicks = function() {
                        const s = scope.start.clone();
                        const e = getMaxTime().clone();
                        var tick = {
                            'unit': d3.time.minute,
                            'count': 0,
                            'format': d3.time.format("%H:%M")
                        };
                        if(e.diff(s, 'days') > 4) {
                            tick.unit = d3.time.day;
                            tick.count = Math.ceil(Math.pow(e.diff(s, 'days'), 2));
                            tick.format = d3.time.format("%b %d")
                        } else if(e.diff(s, 'days') >= 2) {
                            tick.unit = d3.time.day;
                            tick.count = 1;
                            tick.format = d3.time.format("%b %d")
                        } else if(e.diff(s, 'days') > 0) {
                            tick.unit = d3.time.hour;
                            tick.count = 12;
                            tick.format = d3.time.format("%H:%M")
                        } else if(e.diff(s, 'hours') > 12) {
                            tick.unit = d3.time.hour;
                            tick.count = 6;
                            tick.format = d3.time.format("%H:%M")
                        } else if(e.diff(s, 'minutes') < 30) {
                            tick.unit = d3.time.minute;
                            tick.count = 5;
                            tick.format = d3.time.format("%H:%M")
                        } else {
                            tick.unit = d3.time.hour;
                            tick.count = 3;
                            tick.format = d3.time.format("%H:%M")
                        }
                        return tick;
                    };

                    var xScale = d3.time.scale()
                        .domain([scope.start.toDate(), getMaxTime().toDate()])
                        .range([padding, w - padding]);

                    var yScale = d3.scale.linear()
                        .domain([0, 1])
                        .range([h - padding, padding]);

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
                            if (moment.isMoment(d.datetime)) {
                                d.datetime = d.datetime.toDate();
                            }
                            d.value = +d.value;
                        });

                        //Update scale domains
                        xScale.domain([scope.start.toDate(), getMaxTime().toDate()]);
                        yScale.domain([0, d3.max(dataset, function(d) { return d.value })]);

                        //Select…
                        var lines = svg.selectAll(".lecture-multiple-line")
                            .data(dataset, key);

                        //Enter…
                        lines.enter()
                            .append("line")
                            .attr("x1", function (d) {
                                return xScale(d.datetime);
                            })
                            .attr("y1", h - padding)
                            .attr("x2", function (d) {
                                return xScale(d.datetime);
                            })
                            .attr("y2", padding)
                            .attr("class", "lecture-multiple-line")
                            .attr("stroke-width", 2)
                            .on('mouseover', function (d) {
                                d3.select("circle")
                                    .attr("cx", xScale(d.datetime))
                                    .attr("cy", yScale(d.value))
                                    .attr("fill", "rgba(47, 100, 89, 1)"); // #2f6459
                            })
                            .on('mouseout', function (d) {
                                d3.select("circle")
                                    .transition('circle-' + key(d) + '-mouseout')
                                    .duration(10)
                                    .attr("fill", "rgba(0, 0, 0, 0)");
                            });

                        var line = d3.svg.line()
                            .x(function(d) { return xScale(d.datetime); })
                            .y(function(d) { return yScale(d.value); });

                        svg.append("path")
                            .datum(dataset)
                            .attr("class", "lecture-multiple-path")
                            .attr("d", line);

                        // on hover tip
                        svg.append("circle")
                            .attr("cx", 0)
                            .attr("cy", 0)
                            .attr("r", 3)
                            .attr("fill", "rgba(0, 0, 0, 0)");

                        //Create X axis
                        ticks = getTicks();
                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + (h - padding) + ")")
                            .call(xAxis
                                .ticks(ticks.unit, ticks.count)
                                .tickFormat(ticks.format)
                            );

                        //Create Y axis
                        svg.append("g")
                            .attr("class", "y axis")
                            .attr("transform", "translate(" + padding + ",0)")
                            .call(yAxis);
                    };

                    scope.$watchGroup(['data', 'maxVal', 'start', 'end', 'refresh'], function () {
                        scope.render(angular.copy(scope.data));
                    });
                }
            };
        }]);