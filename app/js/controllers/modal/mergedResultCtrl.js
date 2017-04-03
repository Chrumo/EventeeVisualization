/**
 * @author tomas
 */
angular.module('diploma').controller("MergedResultCtrl", [
    '$scope',
    '$uibModalInstance',
    '$log',
    'eventService',
    'converterFactory',
    'lectureIds',
    function ($scope, $uibModalInstance, $log, eventService, converterFactory, lectureIds) {

        $scope.lectures = converterFactory.idDictionaryToArray(eventService.getLectureData(lectureIds));

        $scope.lectureComparison = eventService.getLectureComparisonData(lectureIds);

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $log.debug('MergedResultCtrl initialized.');
    }]);