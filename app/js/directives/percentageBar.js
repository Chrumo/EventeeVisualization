/**
 * Created by tomas on 27.11.16.
 */
angular.module('diploma')
    .directive('percentageBar',
        function ($window, $timeout, $log) {
            return {
                restrict: 'E',
                scope: {
                    amount: '=',
                    max: '='
                },
                link: function (scope, element) {
                    if (typeof scope.max === 'undefined') {
                        scope.max = 100;
                    }

                    if (scope.amount > scope.max) {
                        $log.error("Amount cannot be bigger than maximal value.");
                        return;
                    }

                    var renderTimeout;
                    var w = 70;
                    var h = 17;

                    var elem = $window.d3.select(element[0]);

                    var svg = elem
                        .append('svg')
                        .style('width', w)
                        .style('height', h);

                    scope.$watchGroup(['amount', 'max'], function (newData) {
                        scope.render(newData[0], newData[1]);
                    }, true);

                    scope.render = function (amount, max) {
                        if(angular.isUndefined(amount) || angular.isUndefined(max)) {
                            return;
                        }
                        if (renderTimeout) clearTimeout(renderTimeout);

                        svg.selectAll('*').remove();

                        var textColor = '#fff';
                        if(amount/max < 0.25) {
                            textColor = '#000';
                        }

                        renderTimeout = $timeout(function () {
                            var xScale = d3.scale.linear()
                                .domain([0, max])
                                .range([0, w]);

                            if(amount > 0) {
                                svg.append('rect')
                                    .attr('height', h)
                                    .attr('width', xScale(amount))
                                    .attr('x', 0)
                                    .attr('y', 0)
                                    .attr('fill', "#4a9e8d")
                                    .transition()
                                    .duration(1000)
                                    .attr('width', xScale(amount));
                                svg.append('text')
                                    .attr('fill', textColor)
                                    .attr('y', h - 3)
                                    .attr('x', 5)
                                    .text(amount);
                            } else {
                                svg.append('text')
                                    .attr('fill', '#000')
                                    .attr('y', h - 3)
                                    .attr('x', 5)
                                    .text("No content");
                            }
                        }, 200);
                    };
                }
            }
        });