/**
 * @author tomas Factory provides modal control.
 */
angular.module('diploma').factory('modalFactory',
    [
        '$uibModal',
        '$log',
        function ($uibModal, $log) {
            $log.debug("modalFactory initialized");

            return {
                'openMergedResult': function (lectureIds) {
                    return $uibModal.open({
                        animation: true,
                        templateUrl: 'views/modals/merged_result.html',
                        controller: 'MergedResultCtrl',
                        size: 'lg',
                        resolve: {
                            'lectureIds': function () {
                                return lectureIds;
                            }
                        }
                    });
                }
            };
        }]);