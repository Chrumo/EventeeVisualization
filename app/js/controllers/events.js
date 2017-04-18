/**
 * Created by tomas on 10.12.16.
 */
angular.module('diploma').controller("eventsCtrl",
    [
        '$scope',
        '$log',
        'eventService',
        'statisticsTypeService',
        'statisticsType',
        function($scope, $log, eventService, statisticsTypeService, statisticsType) {

        $scope.events = [];
        $scope.max = {};
        $scope.max[statisticsType.REVIEWS] = 0;
        $scope.max[statisticsType.RATING] = 5;
        $scope.max[statisticsType.HALLS] = 0;
        $scope.max[statisticsType.SESSIONS] = 0;
        $scope.max[statisticsType.NEWS_FEEDS] = 0;

        const setMaximalValues = function(type, value) {
            if($scope.max[type] < value) {
                $scope.max[type] = value;
            }
        };

        $scope.isLoading = true;
        $scope.getName = statisticsTypeService.getName;
        $scope.getStatusTranslation = statisticsTypeService.getStatusTranslation;

        eventService.getAllWithStatisticsAsync(function(events) {
            angular.forEach(events, function(event) {
                setMaximalValues(statisticsType.REVIEWS, event[statisticsType.REVIEWS]);
                setMaximalValues(statisticsType.HALLS, event[statisticsType.HALLS]);
                setMaximalValues(statisticsType.SESSIONS, event[statisticsType.SESSIONS]);
                setMaximalValues(statisticsType.NEWS_FEEDS, event[statisticsType.NEWS_FEEDS]);
            });
            $scope.events = events;
            $scope.isLoading = false;
        });

        $scope.sortType = 'name';
        $scope.sortReverse = true;

        var lastChosen = $scope.sortType;
        $scope.resort = function(attr) {
            if(lastChosen !== attr) {
                $scope.sortReverse = false;
                lastChosen = attr;
            }
            $scope.sortType = attr;
            $scope.sortReverse = !$scope.sortReverse;
        };
    }
]);