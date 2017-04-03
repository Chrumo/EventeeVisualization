/**
 * Created by tomas on 26.11.16.
 */
angular.module('diploma')
    .directive('lectureComparison', [
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
                    var h = 300;
                    var padding = 30;

                    var xScale = d3.scale.ordinal()
                        .domain(d3.range(1))
                        .rangeRoundBands([padding, w - padding * 2], 0.05);

                    var yScale = d3.scale.linear()
                        .domain([0, 30])
                        .range([h - padding, padding]);

                    var colorScale = d3.scale.category10();

                    //Define X axis
                    var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .ticks(5);

                    //Define Y axis
                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
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

                    //Create Y axis
                    svg.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + padding + ",0)")
                        .call(yAxis);

                    /****************************************************** RENDER ******************************************************/
                    scope.render = function(dataset) {
                        if (angular.isUndefined(dataset)) {
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

                        //Update scale domains
                        xScale.domain(d3.range(dataset.length));
                        yScale.domain([0, d3.max(dataset, function(d) {
                            return mathFactory.sum(d.values); })]);

                        xAxis.tickFormat(function(i) {
                            if(i > dataset.length) {
                                return '';
                            }
                            return dataset[i].name;
                        });

                        angular.forEach(dataset, function (lecture, i) {
                            var group = svg.append("g")
                                .attr("transform", "translate(" + xScale(i) + ",0)");

                            //Select…
                            var bars = group.selectAll("rect")
                                .data(lecture.values);

                            //Enter…
                            bars.enter()
                                .append("rect")
                                .attr("x", 0)
                                .attr("y", function(d, i) {
                                    var tmpHeight = 0;
                                    for(var index = 0; index < i; index++) {
                                        tmpHeight += h - yScale(lecture.values[index]);
                                    }
                                    return yScale(d) - padding - tmpHeight;
                                })
                                .attr("width", xScale.rangeBand())
                                .attr("height", function(d) {
                                    return h - yScale(d);
                                })
                                .attr("fill", function(d, i) {
                                    return colorScale(i);
                                });
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

                    scope.$watch('data', function(){
                        scope.render(angular.copy(scope.data));
                    });
                }
            };
        }]);