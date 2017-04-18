/**
 * Created by tomas on 26.11.16.
 */
angular.module('diploma')
    .directive('lectureComparison', [
        '$log',
        '$window',
        '$filter',
        'attributeTypeService',
        'mathFactory',
        'attributeType',
        function ($log, $window, $filter, attributeTypeService, mathFactory, attributeType) {
            return {
                restrict: 'E',
                scope: {
                    data: '=',
                    attr: '=?'
                },
                link: function (scope, element) {
                    if(angular.isUndefined(scope.attr)) {
                        scope.attr = attributeType.ALL;
                    }

                    var w = 700;
                    var h = 300;
                    var padding = 30;

                    var xScale = d3.scale.ordinal()
                        .domain(d3.range(1))
                        .rangeRoundBands([padding, w - padding * 2], 0.05);

                    var yScale = d3.scale.linear()
                        .domain([0, 30])
                        .range([h - padding, padding]);

                    //Define X axis
                    var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .ticks(5);

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

                    // Add the text label for the x axis
                    svg.append("text")
                        .attr("transform", "translate(" + (w / 2) + " ," + h + ")")
                        .style("text-anchor", "middle")
                        .text("Lectures");

                    const createTooltip = function() {
                        var tooltip = d3.select("#lecture_comparison_tooltip");

                        if(!tooltip.empty()) {
                            tooltip.remove();
                        }

                        tooltip = elem.append("div")
                            .attr("id", "lecture_comparison_tooltip")
                            .attr("class", "graph_tooltip hidden");

                        var tooltipName = tooltip.append("p")
                            .append("strong")
                            .text("Name: ");
                        tooltipName.append("span")
                            .attr("id", 'lecture_comparison_name')
                            .text("");

                        angular.forEach(scope.attr, function(attrName) {
                            var tooltipAttr = tooltip.append("p")
                                .attr("style", "color: " + attributeTypeService.getColor(attrName))
                                .append("strong")
                                .text(attributeTypeService.getName(attrName) + ": ");
                            tooltipAttr.append("span")
                                .attr("id", 'lecture_comparison_' + attrName)
                                .text("");
                        });
                    };

                    const getRectHeight = function(values) {
                        if(angular.isDefined(values) && !angular.isArray(values)) {
                            values = [values];
                        }
                        return h - padding - yScale(mathFactory.sum(values));
                    };

                    const getRectY = function(values, i) {
                        var tmpHeight = 0;
                        var attrNum = scope.attr.length;
                        for(var index = attrNum; index >= i; index--) {
                            tmpHeight += getRectHeight(values[index]);
                        }
                        return h - padding - tmpHeight;
                    };

                    /******************************************** RENDER ********************************************/
                    scope.render = function(dataset) {
                        if (angular.isUndefined(dataset) || dataset.length === 0
                            || dataset[0].normalized.length !== scope.attr.length) {
                            return;
                        }

                        createTooltip();

                        dataset.forEach(function(d) {
                            d.id = +d.id;
                            var intNormalizedValues = [];
                            angular.forEach(d.normalized, function(value) {
                                intNormalizedValues.push(+value);
                            });
                            d.normalized = intNormalizedValues;
                            var intValues = [];
                            angular.forEach(d.values, function(value) {
                                intValues.push(+value);
                            });
                            d.values = intValues;
                        });

                        //Update scale domains
                        xScale.domain(d3.range(dataset.length));
                        yScale.domain([0, d3.max(dataset, function(d) {
                            return mathFactory.sum(d.normalized); })]);

                        xAxis.tickFormat('');

                        svg.selectAll(".lecture-bar").remove();
                        svg.selectAll(".group-legend").remove();

                        angular.forEach(dataset, function (lecture, i) {
                            var group = svg.append("g")
                                .attr('class', 'lecture-bar')
                                .attr("transform", "translate(" + xScale(i) + ",0)");

                            //Select…
                            var bars = group.selectAll("rect")
                                .data(lecture.normalized);

                            //Enter…
                            bars.enter()
                                .append("rect")
                                .attr("x", 0)
                                .attr("y", function(d, i) {
                                    return getRectY(lecture.normalized, i);
                                })
                                .attr("width", xScale.rangeBand())
                                .attr("height", function(d) {
                                    return getRectHeight(d);
                                })
                                .attr("fill", function(d, i) {
                                    return attributeTypeService.getColor(scope.attr[i]);
                                })
                                .on("mouseover", function(d, highlightIndex) {
                                    // Get this bar's x/y values, then augment for the tooltip
                                    var xPosition = xScale(i) + xScale.rangeBand() / 2;
                                    var yPosition = getRectHeight(dataset[i].normalized) + 2 * padding;

                                    //Update the tooltip position and value
                                    var tooltip = d3.select("#lecture_comparison_tooltip")
                                        .style("left", xPosition + "px")
                                        .style("bottom", yPosition + "px");

                                    tooltip.select("#lecture_comparison_name")
                                        .text(dataset[i].name);
                                    angular.forEach(scope.attr, function(attr, index) {
                                        tooltip.select("#lecture_comparison_" + attr)
                                            .text($filter('number')(dataset[i].values[index]));
                                    });

                                    //Show the tooltip
                                    tooltip.classed("hidden", false);
                                })
                                .on("mouseout", function() {
                                    //Hide the tooltip
                                    var tooltip = d3.select("#lecture_comparison_tooltip");
                                    tooltip.classed("hidden", true);
                                });
                        });

                        //Legend...
                        var legend = svg.append("g")
                            .attr("class", "group-legend")
                            .attr("transform", "translate(" + (w - 114) + ",0)");

                        legend.append("rect")
                            .attr("class", "data-legend")
                            .attr("width", 114)
                            .attr("height", 3 + scope.attr.length * 13);

                        legend.selectAll("circle")
                            .data(scope.attr)
                            .enter()
                            .append("circle")
                            .attr("cx", 10)
                            .attr("cy", function(d, i) {
                                return i * 13 + 8;
                            })
                            .attr("r", 5)
                            .attr("fill", function(d, i) {
                                return attributeTypeService.getColor(scope.attr[i]);
                            });

                        legend.selectAll("text")
                            .data(scope.attr)
                            .enter()
                            .append("text")
                            .text(function(d, i) {
                                return attributeTypeService.getName(scope.attr[i]);
                            })
                            .attr('x', 20)
                            .attr('y', function(d, i) {
                                return i * 13 + 13;
                            })
                            .attr('fill', 'black');

                        //Update X axis
                        svg.select(".x.axis")
                            .transition()
                            .duration(1000)
                            .call(xAxis);

                    };

                    scope.$watchGroup(['data', 'attr'], function(){
                        scope.render(angular.copy(scope.data));
                    }, true);
                }
            };
        }]);