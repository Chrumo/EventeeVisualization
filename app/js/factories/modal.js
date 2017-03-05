/**
 * @author tomas Factory provides modal control.
 */
angular.module('diploma').factory('modalFactory',
    [
        '$uibModal',
        '$log',
        'converterFactory',
        function ($uibModal, $log, converterFactory) {
            $log.debug("modalFactory initialized");

            return {
                'openMergedResult': function (lectures) {
                    return $uibModal.open({
                        animation: true,
                        templateUrl: 'views/modals/merged_result.html',
                        controller: 'MergedResultCtrl',
                        size: 'lg',
                        resolve: {
                            'lectures': function () {
                                if(!angular.isArray(lectures)) {
                                    lectures = converterFactory.idDictionaryToArray(lectures);
                                }
                                return lectures;
                            }
                        }
                    });
                }
            };
        }]);