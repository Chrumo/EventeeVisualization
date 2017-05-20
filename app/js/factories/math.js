/**
 * Factory containing function helping with math problems.
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').factory('mathFactory',
    [
        '$log',
        function ($log) {
            $log.debug("mathFactory initialized");

            /**
             * Returns value of obj[key] when key is defined. Else it returns obj.
             * @param obj
             * @param key
             * @return {*}
             * @private
             */
            const _getVal = function (obj, key) {
                if(angular.isUndefined(key)) {
                    return obj;
                } else {
                    return obj[key];
                }
            };

            /**
             * Return sum of input arr.
             * @param arr
             * @param key
             * @return {number}
             */
            const sum = function (arr, key) {
                var sum = 0;
                angular.forEach(arr, function(obj) {
                    sum += _getVal(obj, key);
                });
                return sum;
            };

            /**
             * Return average value of input arr.
             * @param arr
             * @param key
             * @return {number}
             */
            const average = function (arr, key) {
                if(arr.length === 0) {
                    return 0;
                }
                return 1.0 * sum(arr, key) / arr.length;
            };

            /**
             * Return median of array of Moments.
             * @param array
             * @return {*}
             */
            const timeMedian = function (array) {
                array.sort(function(a, b) {
                    return a.diff(b);
                });

                var half = Math.floor(array.length / 2);

                if(array.length % 2)
                    return array[half];
                else
                    return moment((array[half-1].valueOf() + array[half].valueOf()) / 2.0, 'x');
            };

            const max = Math.max;

            return {
                'sum': sum,
                'average': average,
                'timeMedian': timeMedian,
                'max': max
            };
        }]);