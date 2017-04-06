/**
 * Created by tomas on 26.11.16.
 */
angular.module('diploma')
    .directive('lectureComparison', [
        '$log',
        '$window',
        'attributeTypeService',
        'mathFactory',
        'attributeType',
        function ($log, $window, attributeTypeService, mathFactory, attributeType) {
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

                    const getRectHeight = function(value) {
                        return h - padding - yScale(value);
                    };

                    const getRectY = function(values, i) {
                        var tmpHeight = 0;
                        for(var index = 0; index <= i; index++) {
                            tmpHeight += getRectHeight(values[index]);
                        }
                        return h - padding - tmpHeight;
                    };

                    /****************************************************** RENDER ******************************************************/
                    scope.render = function(dataset) {
                        if (angular.isUndefined(dataset) || dataset.length === 0
                            || dataset[0].values.length !== scope.attr.length) {
                            return;
                        }

                        dataset.forEach(function(d) {
                            d.id = +d.id;
                            var intValues = [];
                            angular.forEach(d.values, function(value) {
                                intValues.push(+value);
                            });
                            d.values = intValues;
                        });

                        dataset.reverse();

                        //Update scale domains
                        xScale.domain(d3.range(dataset.length));
                        yScale.domain([0, d3.max(dataset, function(d) {
                            return mathFactory.sum(d.values); })]);

                        xAxis.tickFormat('');

                        svg.selectAll(".lecture-bar").remove();
                        svg.selectAll(".group-legend").remove();

                        angular.forEach(dataset, function (lecture, i) {
                            var group = svg.append("g")
                                .attr('class', 'lecture-bar')
                                .attr("transform", "translate(" + xScale(i) + ",0)");

                            //Select…
                            var bars = group.selectAll("rect")
                                .data(lecture.values);

                            //Enter…
                            bars.enter()
                                .append("rect")
                                .attr("x", 0)
                                .attr("y", function(d, i) {
                                    return getRectY(lecture.values, i);
                                })
                                .attr("width", xScale.rangeBand())
                                .attr("height", function(d) {
                                    return getRectHeight(d);
                                })
                                .attr("fill", function(d, i) {
                                    return attributeTypeService.getColor(scope.attr[i]);
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