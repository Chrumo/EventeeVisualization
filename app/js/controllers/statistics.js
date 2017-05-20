/**
 * Conference detail window controller.
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').controller('StatisticsCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$log',
    '$timeout',
    'SweetAlert',
    'eventService',
    'filterService',
    'converterFactory',
    'modalFactory',
    'filter',
    'dataType',
    function ($scope, $state, $stateParams, $log, $timeout, SweetAlert, eventService, filterService, converterFactory,
              modalFactory, filter, dataType) {
        $log.debug("StatisticsCtrl initialized");

        /**
         * Whether to show loading bar.
         * @type {boolean}
         */
        $scope.isLoading = true;

        /**
         * Contain all data about event.
         * @type {{}}
         */
        $scope.data = {};
        $scope.filterModel = filter;
        $scope.refresh = false;
        /**
         * Contain all angular slicks.
         * @type {{}}
         */
        $scope.slicks = {};
        /**
         * Contain which attribute is showing.
         * @type {string}
         */
        $scope.dataType = dataType.REVIEWS;
        /**
         * Whether to show data or not.
         * @type {boolean}
         */
        $scope.viewAllData = true;

        eventService.getDataAsync(parseInt($stateParams.id), function(data) {
            $scope.data = data;
            $scope.days = eventService.getDaysAsArray();
            $scope.halls = eventService.getHallsAsArray();
            $scope.isLoading = false;
        });

        /**
         * This function redraw all hallInsight directives and show/hide every lectures miniature.
         * @param lectureId - represent lecture id of (de)selected lecture. If null, all lectures are checked.
         */
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

        /**
         * Toggle all lectures selection.
         */
        $scope.toggleAll = function() {
            filterService.toggleAll();
            filterChanged();
        };

        /**
         * Toggle one day selection.
         */
        $scope.toggleDay = function(order) {
            filterService.toggleDay(order);
            filterChanged();
        };

        /**
         * Toggle one hall selection.
         */
        $scope.toggleHall = function(hallId) {
            filterService.toggleHall(hallId);
            filterChanged();
        };

        /**
         * Gets data for hall insight visualization.
         */
        $scope.getHallInsightData = function (day, hall) {
            return eventService.getHallInsightData(+day.order, +hall.id, $scope.dataType);
        };

        /**
         * Toggle one lecture selection.
         */
        $scope.onLectureSelect = function(lectureId) {
            filterService.toggleLecture(lectureId);
            filterChanged(lectureId);
        };

        /**
         * Return true if some lectures in given day and hall is selected.
         * @param day
         * @param hall
         * @return {boolean}
         */
        $scope.isSomeSelected = function(day, hall) {
            return filterService.isSomeSelected(day.order, hall.id);
        };

        /**
         * Return all lectures ids from given day and hall.
         * @param day
         * @param hall
         * @return {Array}
         */
        $scope.getSelectedIds = function(day, hall) {
            return filterService.getSelectedIds(day.order, hall.id);
        };


        /**
         * Return lecture miniature data.
         */
        $scope.getLectureMultipleData = function(lectureId) {
            return eventService.getLectureData(lectureId, $scope.dataType)[lectureId];
        };

        /**
         * Opens lecture comparison modal window with selected lectures.
         */
        $scope.merge = function() {
            modalFactory.openMergedResult(filterService.getSelectedIds(), $scope.dataType);
        };

        /**
         * Return true if at least one lecture is selected.
         * @return {boolean}
         */
        $scope.canCompare = function() {
            return filterService.isSomeSelected();
        };

        /**
         * Redirect user to conference list.
         * If some lecture is selected user is promped to determine if he wants to redirect.
         */
        $scope.redirectToEvents = function () {
            if(filterService.isSomeSelected()) {
                SweetAlert.confirm("Do you really want to go back?",
                    {title : "Some lectures are selected"})
                    .then(function(p) {
                        if(p) {
                            $state.go('events');
                        }
                    });
            } else {
                $state.go('events');
            }
        };

        /**
         * Return true if chosen attribute is dataType.AVERAGE.
         * @return {boolean}
         */
        $scope.isAverageDataTypeSelected = function() {
            return $scope.dataType === dataType.AVERAGE;
        };

        /**
         * Change chosen data type attribute.
         */
        $scope.changeDataType = function () {
            $scope.viewAllData = false;
            if($scope.isAverageDataTypeSelected()) {
                $scope.dataType = dataType.REVIEWS;
            } else {
                $scope.dataType = dataType.AVERAGE;
            }
            $timeout(function() {
                $scope.viewAllData = true;
            });
        };

        /**
         * Opens help modal window.
         */
        $scope.openHelp = function () {
            modalFactory.openHelp('img/hall-insight-help.png');
        }
    }
]);