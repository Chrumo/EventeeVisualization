/**
 * Conference list window controller.
 * Created by tomas on 10.12.16.
 */
angular.module('diploma').controller("eventsCtrl",
    [
        '$scope',
        '$log',
        'eventService',
        'statisticsTypeService',
        'statisticsType',
        function ($scope, $log, eventService, statisticsTypeService, statisticsType) {

            /**
             * Contain all information about all events.
             * @type {Array}
             */
            $scope.events = [];
            /**
             * Contain maximal values of all attributes.
             * @type {{}}
             */
            $scope.max = {};
            $scope.max[statisticsType.REVIEWS] = 0;
            $scope.max[statisticsType.RATING] = 5;
            $scope.max[statisticsType.HALLS] = 0;
            $scope.max[statisticsType.SESSIONS] = 0;
            $scope.max[statisticsType.NEWS_FEEDS] = 0;

            /**
             * Sets new max value of given attribute.
             * @param type - Given attribute
             * @param value
             * @private
             */
            const setMaximalValues = function (type, value) {
                if ($scope.max[type] < value) {
                    $scope.max[type] = value;
                }
            };

            /**
             * Whether to show loading bar.
             * @type {boolean}
             */
            $scope.isLoading = true;
            $scope.getName = statisticsTypeService.getName;
            $scope.getStatusTranslation = statisticsTypeService.getStatusTranslation;

            eventService.getAllWithStatisticsAsync(function (events) {
                angular.forEach(events, function (event) {
                    setMaximalValues(statisticsType.REVIEWS, event[statisticsType.REVIEWS]);
                    setMaximalValues(statisticsType.HALLS, event[statisticsType.HALLS]);
                    setMaximalValues(statisticsType.SESSIONS, event[statisticsType.SESSIONS]);
                    setMaximalValues(statisticsType.NEWS_FEEDS, event[statisticsType.NEWS_FEEDS]);
                });
                $scope.events = events;
                $scope.isLoading = false;
            });

            /**
             * Contain attribute type used by sort function.
             * @type {string}
             */
            $scope.sortType = 'name';
            /**
             * Whether to sort in ascending order.
             * @type {boolean}
             */
            $scope.sortReverse = false;

            var lastChosen = $scope.sortType;
            /**
             * Resort events.
             * @param attr
             */
            $scope.resort = function (attr) {
                if (lastChosen !== attr) {
                    $scope.sortReverse = false;
                    lastChosen = attr;
                }
                $scope.sortType = attr;
                $scope.sortReverse = !$scope.sortReverse;
            };
        }
    ]);