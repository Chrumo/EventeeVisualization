/**
 * Final modal window controller.
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
    'dataType',
    'lectureIds',
    'type',
    function ($scope, $uibModalInstance, $log, eventService, attributeTypeService, converterFactory,
              attributeType, dataType, lectureIds, type) {

        /**
         * Contain information about all selected lectures.
         * @type {Array}
         */
        $scope.lectures = converterFactory.idDictionaryToArray(eventService.getLectureData(lectureIds, type));

        /**
         * Contain information about chosen attribute.
         * @type {*}
         */
        $scope.attributeType = attributeType;
        /**
         * Contain human readable name of chosen attribute.
         * @type {getName}
         */
        $scope.getAttributeName = attributeTypeService.getName;

        /**
         * Contain which attribute is selected and which is not.
         * @type {Array}
         */
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

        /**
         * Return array of chosen attributes.
         * @return {Array}
         * @private
         */
        const getAttributesArray = function() {
            var retArr = [];
            angular.forEach($scope.attributes, function(attr, index) {
                if(attr.value) retArr.push(index);
            });
            return retArr;
        };

        $scope.orderBy = ''; // default value => order by sum

        /**
         * Redraw lecture comparison visualization when user choose different attributes.
         */
        $scope.attributeChanged = function() {
            $scope.attributesArr = getAttributesArray();
            $scope.lectureComparison = eventService.getLectureComparisonData(lectureIds, $scope.attributesArr, $scope.orderBy);
        };

        /**
         * Gets human readable name of chosen attribute.
         * @return {string}
         */
        $scope.getYAxisText = function() {
            return type === dataType.AVERAGE ? "Average rating" : "Number of ratings";
        };

        /**
         * Contain lecture comparison data.
         * @type {Array}
         */
        $scope.lectureComparison = eventService.getLectureComparisonData(lectureIds);

        /**
         * Close modal window.
         */
        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $log.debug('MergedResultCtrl initialized.');
    }]);