/**
 * Factory containing function which opens modal windows.
 * @author tomas Factory provides modal control.
 */
angular.module('diploma').factory('modalFactory',
    [
        '$uibModal',
        '$log',
        function ($uibModal, $log) {
            $log.debug("modalFactory initialized");

            return {
                /**
                 * Open merged result modal window.
                 * @param lectureIds - ids of lectures showed in this modal.
                 * @param dataType
                 */
                'openMergedResult': function (lectureIds, dataType) {
                    return $uibModal.open({
                        animation: true,
                        templateUrl: 'views/modals/merged_result.html',
                        controller: 'MergedResultCtrl',
                        size: 'lg',
                        resolve: {
                            'lectureIds': function () {
                                return lectureIds;
                            },
                            'type': function () {
                                return dataType;
                            }
                        }
                    });
                },
                /**
                 * Open help window containing only image.
                 * @param image - url to the image.
                 */
                'openHelp': function (image) {
                    return $uibModal.open({
                        animation: true,
                        template: '<img src="' + image + '" style="width: 100%;height: 100%;">',
                        size: 'lg',
                        windowClass: 'help-modal'
                    });
                }
            };
        }]);