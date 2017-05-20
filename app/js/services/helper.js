/**
 * Service providing helpers functions.
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').service('helperService',
    [
        '$log',
        'helpers',
        function ($log, helpers) {
            $log.debug("helperService initialized");

            /**
             * Sets maximal numbers of ratings.
             * @param num
             */
            var setMaxNumberOfRatings = function(num) {
                if(angular.isDefined(num) && helpers.maxNumberOfRatings < num) {
                    helpers.maxNumberOfRatings = num;
                }
            };

            /**
             * Gets maximal numbers of ratings.
             * @return {number}
             */
            var getMaxNumberOfRatings = function() {
                return helpers.maxNumberOfRatings;
            };

            /**
             * Save minimal hall start from one day.
             * @param day
             * @param start
             */
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

            /**
             * Gets minimal hall start from one day.
             * @param day
             */
            var getHallStart = function(day) {
                return helpers.halls[day].start;
            };

            /**
             * Save maximal hall end from one day.
             * @param day
             * @param end
             */
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

            /**
             * Gets maximal hall end from one day.
             * @param day
             */
            var getHallEnd = function(day) {
                return helpers.halls[day].end;
            };

            /**
             * Clear helpers value.
             */
            const clear = function () {
                helpers.maxNumberOfRatings = 0;
                angular.forEach(helpers.halls, function (h, i) {
                    delete helpers.halls[i];
                });
            };

            return {
                'setMaxNumberOfRatings': setMaxNumberOfRatings,
                'getMaxNumberOfRatings': getMaxNumberOfRatings,
                'setHallStart': setHallStart,
                'getHallStart': getHallStart,
                'setHallEnd': setHallEnd,
                'getHallEnd': getHallEnd,
                'clear': clear
            };
        }]);