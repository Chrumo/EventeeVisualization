/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').service('helperService',
    [
        '$log',
        'helpers',
        function ($log, helpers) {
            $log.debug("helperService initialized");

            var setMaxNumberOfRatings = function(num) {
                if(angular.isDefined(num) && helpers.maxNumberOfRatings < num) {
                    helpers.maxNumberOfRatings = num;
                }
            };

            var getMaxNumberOfRatings = function() {
                return helpers.maxNumberOfRatings;
            };

            var setHallStart = function(day, start) {
                if(angular.isUndefined(day)) {
                    return;
                }
                if(angular.isUndefined(helpers.halls[day])) {
                    helpers.halls[day] = {
                        'start': moment().add(100, 'y'),
                        'end': moment().subtract(100, 'y')
                    }
                }
                if(angular.isObject(start) && moment.isMoment(start) &&
                    start.isBefore(helpers.halls[day].start)) {
                    helpers.halls[day].start = start.clone().minutes(0);
                }
            };

            var getHallStart = function(day) {
                return helpers.halls[day].start;
            };

            var setHallEnd = function(day, end) {
                if(angular.isUndefined(day)) {
                    return;
                }
                if(angular.isUndefined(helpers.halls[day])) {
                    helpers.halls[day] = {
                        'start': moment().add(100, 'y'),
                        'end': moment().subtract(100, 'y')
                    }
                }
                if(angular.isObject(end) && moment.isMoment(end) &&
                    end.isAfter(helpers.halls[day].end)) {
                    helpers.halls[day].end = end.clone().hours(end.hour() + 1).minutes(0);
                }
            };

            var getHallEnd = function(day) {
                return helpers.halls[day].end;
            };

            var getMinMaxDate = function(object, minValue, maxValue) {
                if(!angular.isArray(object) && !angular.isObject(object) &&
                    (angular.isArray(object) && object.length === 0) &&
                    (angular.isObject(object) && _.isEmpty(object))) {
                    return {
                        'min': moment(),
                        'max': moment()
                    };
                }
                var retArr = {
                    'min': moment().add('100', 'y'),
                    'max': moment().subtract('100', 'y')
                };
                angular.forEach(object, function(obj) {
                    if(obj[minValue].isBefore(retArr.min)) {
                        retArr.min = obj[minValue];
                    }
                    if(obj[maxValue].isAfter(retArr.max)) {
                        retArr.max = obj[maxValue];
                    }
                });
            };

            const clear = function () {
                helpers.maxNumberOfRatings = 0;
                angular.forEach(helpers.halls, function (h, i) {
                    delete helpers.halls[i];
                });
            };

            return {
                'getMinMaxDate': getMinMaxDate,
                'setMaxNumberOfRatings': setMaxNumberOfRatings,
                'getMaxNumberOfRatings': getMaxNumberOfRatings,
                'setHallStart': setHallStart,
                'getHallStart': getHallStart,
                'setHallEnd': setHallEnd,
                'getHallEnd': getHallEnd,
                'clear': clear
            };
        }]);