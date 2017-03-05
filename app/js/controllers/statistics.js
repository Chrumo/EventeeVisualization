/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').controller('StatisticsCtrl', [
    '$scope',
    '$stateParams',
    '$log',
    '$timeout',
    'eventService',
    'filterService',
    'converterFactory',
    'modalFactory',
    'filter',
    function ($scope, $stateParams, $log, $timeout, eventService, filterService, converterFactory, modalFactory,
              filter) {
        $log.debug("StatisticsCtrl initialized");

        $scope.isLoading = true;

        $scope.data = {};
        $scope.filterModel = filter;
        $scope.refresh = false;
        $scope.slicks = {};

        eventService.getDataAsync(parseInt($stateParams.id), function(data) {
            $scope.data = data;
            $scope.days = eventService.getDaysAsArray();
            $scope.halls = eventService.getHallsAsArray();
            $scope.isLoading = false;
        });

        var filterChanged = function(lectureId) {
            $scope.refresh = !$scope.refresh;
            angular.forEach($scope.days, function(day) {
                $scope.slicks[day.order] = {};
                angular.forEach($scope.halls, function (hall) {
                    var lectures = [];
                    var lecturesArr = converterFactory.idDictionaryToArray(
                        eventService.getLectureData(filterService.getSelectedIds(day.order, hall.id))
                    );
                    lecturesArr.sort(function(a, b) {
                        return a.start.isAfter(b.start);
                    });
                    angular.forEach(lecturesArr, function (lecture) {
                        lectures.push(+lecture.id);
                    });
                    $scope.slicks[day.order][hall.id] = {
                        centerMode: true,
                        centerPadding: '60px',
                        variableWidth: true,
                        enabled: true,
                        draggable: true,
                        infinite: false,
                        method: {},
                        event: {
                            init: function (event, slick) {
                                if(angular.isDefined(lectureId)) {
                                    const index = lectures.indexOf(+lectureId);
                                    if(index > 0) {
                                        slick.goTo(index);
                                    }
                                }
                            }
                        },
                        lectures: []
                    };
                    $timeout(function () {
                        $scope.slicks[day.order][hall.id].lectures = lectures;
                    });
                })
            });
        };

        filterChanged();

        $scope.toggleAll = function() {
            filterService.toggleAll();
            filterChanged();
        };

        $scope.toggleDay = function(order) {
            filterService.toggleDay(order);
            filterChanged();
        };

        $scope.toggleHall = function(hallId) {
            filterService.toggleHall(hallId);
            filterChanged();
        };

        $scope.getHallInsightDate = function (day, hall) {
            return eventService.getHallInsightData(+day.order, +hall.id);
        };

        $scope.onLectureSelect = function(lectureId) {
            filterService.toggleLecture(lectureId);
            filterChanged(lectureId);
        };

        $scope.isSomeSelected = function(day, hall) {
            return filterService.isSomeSelected(day.order, hall.id);
        };

        $scope.getSelectedIds = function(day, hall) {
            return filterService.getSelectedIds(day.order, hall.id);
        };

        $scope.getLectureMultipleData = function(lectureId) {
            return eventService.getLectureData(lectureId)[lectureId];
        };

        $scope.merge = function() {
            var lectures = eventService.getLectureData(filterService.getSelectedIds());
            modalFactory.openMergedResult(lectures);
        };
    }
]);