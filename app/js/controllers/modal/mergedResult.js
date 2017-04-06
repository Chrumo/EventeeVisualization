/**
 * @author tomas
 */
angular.module('diploma').controller("MergedResultCtrl", [
    '$scope',
    '$uibModalInstance',
    '$log',
    'eventService',
    'attributeTypeService',
    'converterFactory',
    'attributeType',
    'lectureIds',
    function ($scope, $uibModalInstance, $log, eventService, attributeTypeService, converterFactory,
              attributeType, lectureIds) {

        $scope.lectures = converterFactory.idDictionaryToArray(eventService.getLectureData(lectureIds));

        $scope.attributeType = attributeType;
        $scope.getAttributeName = attributeTypeService.getName;

        $scope.attributesArr = attributeType.ALL;
        $scope.attributes = {};
        $scope.attributes[attributeType.RATINGS] = {
            'value': true
        };
        $scope.attributes[attributeType.COMMENTS] = {
            'value': true
        };
        $scope.attributes[attributeType.LENGTH] = {
            'value': true
        };
        $scope.attributes[attributeType.FAVORITES] = {
            'value': true
        };
        $scope.attributes[attributeType.AVG_RATING] = {
            'value': true
        };

        const getAttributesArray = function() {
            var retArr = [];
            angular.forEach($scope.attributes, function(attr, index) {
                if(attr.value) retArr.push(index);
            });
            return retArr;
        };

        $scope.attributeChanged = function() {
            $scope.attributesArr = getAttributesArray();
            $scope.lectureComparison = eventService.getLectureComparisonData(lectureIds, $scope.attributesArr);
        };

        $scope.lectureComparison = eventService.getLectureComparisonData(lectureIds);

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $log.debug('MergedResultCtrl initialized.');
    }]);