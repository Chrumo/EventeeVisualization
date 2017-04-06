/**
 * Created by tomas on 26.11.16.
 */
angular.module('diploma')
    .directive('mergedResult', [
        '$log',
        '$window',
        'mathFactory',
        function ($log, $window, mathFactory) {
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

                    const getLastLectureEndTime = function () {
                        var maxTime = moment().subtract(100, 'y');
                        angular.forEach(scope.data, function (lecture) {
                            if(lecture.end.isAfter(maxTime)) {
                                maxTime = lecture.end.clone();
                            }
                        });
                        return maxTime;
                    };

                    const getMaxTime = function() {
                        var endArr = [];
                        var maxTime = getLastLectureEndTime();
                        angular.forEach(scope.data, function (lecture) {
                            var endTime = maxTime.clone();
                            var push = false;
                            angular.forEach(lecture.data, function(rating) {
                                if(rating.datetime.isAfter(endTime)) {
                                    endTime = rating.datetime.clone();
                                    push = true;
                                }
                            });
                            if(push) {
                                endArr.push(endTime);
                            }
                        });
                        if(endArr.length) {
                            return mathFactory.timeMedian(endArr);
                        } else {
                            return maxTime;
                        }
                    };

                    const getTicks = function() {
                        const s = getMinTime().clone();
                        const e = getMaxTime().clone();
                        var tick = {
                            'unit': d3.time.minute,
                            'count': 0,
                            'format': d3.time.format("%H:%M")
                        };
                        if(e.diff(s, 'days') > 4) {
                            tick.unit = d3.time.day;
                            tick.count = Math.ceil(Math.pow(e.diff(s, 'days'), 2) / 3.0);
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
                        .domain([getMinTime().toDate(), getMaxTime().toDate()])
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

                    const draw = function () {
                        svg.select('g.x.axis').call(xAxis);
                        zoom = d3.behavior.zoom()
                            .x(xScale)
                            .on("zoom", draw);
                        zoomRect.call(zoom);
                    };

                    var zoom = d3.behavior.zoom()
                        .x(xScale)
                        .on("zoom", draw);

                    var zoomRect = svg.append("rect")
                        .attr("class", "zoom x box")
                        .attr("width", w - 2 * padding)
                        .attr("height", h - 2 * padding)
                        .attr("transform", "translate(" + 0 + "," + (h - 2 * padding) + ")")
                        .style("visibility", "hidden")
                        .attr("pointer-events", "all")
                        .call(zoom);

                    //Define key function, to be used when binding data
                    var key = function(d) {
                        return d.id;
                    };

                    /****************************************************** RENDER ******************************************************/
                    scope.render = function (dataset) {
                        if (angular.isUndefined(dataset)) {
                            return;
                        }

                        const minDate = getMinTime();
                        const maxDate = getMaxTime();

                        dataset.forEach(function (d) {
                            if (moment.isMoment(d.start)) {
                                d.start = d.start.toDate();
                            }
                            if (moment.isMoment(d.end)) {
                                d.end = d.end.toDate();
                            }
                            var ratings = [];
                            angular.forEach(d.data, function(rating) {
                                var beforeEnd = false;
                                if (moment.isMoment(rating.datetime)) {
                                    if(rating.datetime.isSameOrBefore(maxDate)) {
                                        beforeEnd = true;
                                    }
                                    rating.datetime = rating.datetime.toDate();
                                }
                                rating.value = +rating.value;
                                if(beforeEnd) {
                                    ratings.push(rating);
                                }
                            });

                            const last = angular.copy(ratings[ratings.length - 1]);
                            ratings.push({
                                'datetime': maxDate.toDate(),
                                'value': last.value
                            });

                            d.data = ratings;
                        });

                        //Update scale domains
                        xScale.domain([minDate.toDate(), maxDate.toDate()]);
                        yScale.domain([0, d3.max(dataset, function(d) {
                            return d3.max(d.data, function(rating) {
                                return rating.value;
                            });
                        })]);

                        var line = d3.svg.line()
                            .x(function(d) { return xScale(d.datetime); })
                            .y(function(d) { return yScale(d.value); });

                        var paths = svg.selectAll('.merged-result-path')
                            .data(dataset, key);

                        paths.enter().append("path")
                            .attr("class", "merged-result-path")
                            .attr("stroke-width", 1.5)
                            .style("opacity", "0.5")
                            .attr("d", function(d) {
                                return line(d.data);
                            })
                            .attr("stroke", "#2f6459")
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

                        paths.exit().remove();

                        //Update X axis
                        ticks = getTicks();
                        svg.select(".x.axis")
                            .transition('x-axis')
                            .duration(1000)
                            .call(xAxis
                                    // .ticks(ticks.unit, ticks.count)
                                    // .tickFormat(ticks.format)
                            );

                        //Update Y axis
                        svg.select(".y.axis")
                            .transition('y-axis')
                            .duration(1000)
                            .call(yAxis);
                    };

                    scope.$watch('data', function () {
                        scope.render(angular.copy(scope.data));
                    });
                }
            };
        }]);