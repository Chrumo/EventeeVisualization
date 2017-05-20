/**
 * Directive representing merged result visualization.
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
                    data: '=',
                    yAxisText: '@'
                },
                link: function (scope, element) {
                    var w = 850;
                    var h = 400;
                    var padding = 42;

                    /**
                     * Return minimal time from all lectures starts.
                     * @return {Moment}
                     */
                    const getMinTime = function() {
                        var minTime = moment().add(100, 'y');
                        angular.forEach(scope.data, function (lecture) {
                            if(lecture.start.isBefore(minTime)) {
                                minTime = lecture.start;
                            }
                        });
                        return minTime;
                    };

                    /**
                     * Return maximal time from all lectures ends.
                     * @return {Moment}
                     */
                    const getLastLectureEndTime = function () {
                        var maxTime = moment().subtract(100, 'y');
                        angular.forEach(scope.data, function (lecture) {
                            if(lecture.end.isAfter(maxTime)) {
                                maxTime = lecture.end.clone();
                            }
                        });
                        return maxTime;
                    };

                    /**
                     * Return median of all lectures ends and last ratings.
                     * @return {Moment}
                     */
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

                    var xScale = d3.time.scale()
                        .domain([getMinTime().toDate(), getMaxTime().toDate()])
                        .range([padding, w - padding]);

                    var yScale = d3.scale.linear()
                        .domain([0, 1])
                        .range([h - padding, padding]);

                    //Define X axis
                    var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom");

                    //Define Y axis
                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left");

                    var elem = $window.d3.select(element[0]);

                    //Create SVG element
                    var svg = elem
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

                    svg.append("defs").append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("width", w - 2 * padding)
                        .attr("height", h - 2 * padding)
                        .attr("transform", "translate(" + padding + "," + padding+ ")");

                    //Create X axis
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (h - padding) + ")")
                        .call(xAxis);

                    // Add the text label for the x axis
                    svg.append("text")
                        .attr("transform", "translate(" + (w / 2) + " ," + h + ")")
                        .style("text-anchor", "middle")
                        .text("Date");

                    //Create Y axis
                    svg.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + padding + ",0)")
                        .call(yAxis);

                    // Add the text label for the Y axis
                    svg.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0)
                        .attr("x", 0 - (h / 2))
                        .attr("dy", "1em")
                        .style("text-anchor", "middle")
                        .text(scope.yAxisText);

                    var tooltip = elem.append("div")
                        .attr("id", "merged_result_tooltip")
                        .attr("class", "graph_tooltip hidden");
                    var tooltipName = tooltip.append("p")
                        .append("strong")
                        .text("Name: ");
                    tooltipName.append("span")
                        .attr("id", 'merged_result_name')
                        .text("");
                    var tooltipStart = tooltip.append("p")
                        .append("strong")
                        .text("Start: ");
                    tooltipStart.append("span")
                        .attr("id", 'merged_result_start')
                        .text("");
                    var tooltipEnd = tooltip.append("p")
                        .append("strong")
                        .text("End: ");
                    tooltipEnd.append("span")
                        .attr("id", 'merged_result_end')
                        .text("");
                    var tooltipRatings = tooltip.append("p")
                        .append("strong")
                        .text("Ratings: ");
                    tooltipRatings.append("span")
                        .attr("id", 'merged_result_ratings')
                        .text("");

                    const draw = function () {
                        svg.select('g.x.axis').call(xAxis);
                        update([]);
                        update(angular.copy(scope.data));
                    };

                    var zoom = d3.behavior.zoom()
                        .x(xScale)
                        .scaleExtent([1, 25])
                        .on("zoom", draw);

                    svg.append("rect")
                        .attr("class", "zoom x box")
                        .attr("width", w - 2 * padding)
                        .attr("height", h - padding)
                        .attr("transform", "translate(" + padding + "," + padding + ")")
                        .style("visibility", "hidden")
                        .attr("pointer-events", "all")
                        .call(zoom);

                    /**
                     * Converts data to be more d3 friendly.
                     * @param dataset
                     * @return {*}
                     */
                    const convertData = function (dataset) {
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
                                'datetime': maxDate.clone().add(100, 'y').toDate(),
                                'value': last.value
                            });

                            d.data = ratings;
                        });

                        return dataset;
                    };

                    /**
                     * Draw paths for all lectures.
                     * @param dataset
                     */
                    const drawPaths = function (dataset) {
                        var line = d3.svg.line()
                            .x(function(d) { return xScale(d.datetime); })
                            .y(function(d) { return yScale(d.value); });

                        var paths = svg.selectAll('.merged-result-path')
                            .data(dataset);

                        paths.enter().append("path")
                            .attr("class", "merged-result-path")
                            .attr("stroke-width", 1.5)
                            .style("opacity", "0.5")
                            .attr("d", function(d) {
                                return line(d.data);
                            })
                            .attr("stroke", "#2f6459")
                            .attr("clip-path", "url(#clip)")
                            .on("mouseover", function(d) {
                                d3.select(this)
                                    .style("opacity", "1")
                                    .attr("stroke-width", 3.5);

                                //Get this bar's x/y values, then augment for the tooltip
                                var xPosition = d3.mouse(this)[0] + padding/2;
                                var yPosition = d3.mouse(this)[1] + padding/2;

                                //Update the tooltip position and value
                                var tooltip = d3.select("#merged_result_tooltip")
                                    .style("left", xPosition + "px")
                                    .style("top", yPosition + "px");

                                tooltip.select("#merged_result_name")
                                    .text(d.name);
                                tooltip.select("#merged_result_start")
                                    .text(moment(d.start).format("DD. MMM. YYYY HH:mm"));
                                tooltip.select("#merged_result_end")
                                    .text(moment(d.end).format("DD. MMM. YYYY HH:mm"));
                                tooltip.select("#merged_result_ratings")
                                    .text(d.data.length);

                                //Show the tooltip
                                d3.select("#merged_result_tooltip").classed("hidden", false);
                            })
                            .on("mouseout", function() {
                                d3.select(this)
                                    .style("opacity", "0.5")
                                    .attr("stroke-width", 1.5);

                                //Hide the tooltip
                                d3.select("#merged_result_tooltip").classed("hidden", true);
                            });

                        paths.exit().remove();
                    };

                    /**
                     * Update visualization content.
                     * @param dataset
                     */
                    const update = function(dataset) {
                        drawPaths(convertData(dataset));
                    };

                    /****************************************************** RENDER ******************************************************/
                    scope.render = function (dataset) {
                        if (angular.isUndefined(dataset)) {
                            return;
                        }

                        dataset = convertData(dataset);

                        const minDate = getMinTime();
                        const maxDate = getMaxTime();

                        //Update scale domains
                        xScale.domain([minDate.toDate(), maxDate.toDate()]);
                        yScale.domain([0, d3.max(dataset, function(d) {
                            return d3.max(d.data, function(rating) {
                                return rating.value;
                            });
                        })]);

                        drawPaths(dataset);

                        //Update X axis
                        svg.select(".x.axis")
                            .call(xAxis);

                        //Update Y axis
                        svg.select(".y.axis")
                            .call(yAxis);
                    };

                    scope.$watch('data', function () {
                        scope.render(angular.copy(scope.data));
                    });
                }
            };
        }]);