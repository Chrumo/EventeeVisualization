/**
 * @author tomas
 */
angular.module('diploma').controller("MergedResultCtrl", [
    '$scope',
    '$uibModalInstance',
    '$log',
    'lectures',
    function ($scope, $uibModalInstance, $log, lectures) {

        $scope.lectures = lectures;

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $log.debug('MergedResultCtrl initialized.');
    }]);