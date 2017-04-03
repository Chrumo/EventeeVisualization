/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').factory('mathFactory',
    [
        '$log',
        function ($log) {
            $log.debug("mathFactory initialized");

            const _getVal = function (obj, key) {
                if(angular.isUndefined(key)) {
                    return obj;
                } else {
                    return obj[key];
                }
            };

            const sum = function (arr, key) {
                var sum = 0;
                angular.forEach(arr, function(obj) {
                    sum += _getVal(obj, key);
                });
                return sum;
            };

            const average = function (arr, key) {
                if(arr.length === 0) {
                    return 0;
                }
                return 1.0 * sum(arr, key) / arr.length;
            };

            const max = Math.max;

            return {
                'sum': sum,
                'average': average,
                'max': max
            };
        }]);