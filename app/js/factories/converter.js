/**
 * Factory containing function to convert data from/to server.
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').factory('converterFactory',
    [
        '$log',
        function ($log) {
            $log.debug("converterFactory initialized");

            /**
             * Convert string date to Moment
             * @param date in YYYY-MM-DD format
             * @return Moment
             */
            const dateFromServer = function (date) {
                return moment(date, "YYYY-MM-DD");
            };

            /**
             * Convert Moment date to string
             * @param date
             * @return string in YYYY-MM-DD format
             */
            const dateToServer = function (date) {
                return date.format("YYYY-MM-DD");
            };

            /**
             * Convert string datetime to Moment
             * @param dateTime in YYYY-MM-DD HH:mm:ss format
             * @return Moment
             */
            const dateTimeFromServer = function (dateTime) {
                return moment(dateTime, "YYYY-MM-DD HH:mm:ss");
            };

            /**
             * Convert Moment datetime to string
             * @param dateTime
             * @return string in YYYY-MM-DD HH:mm:ss format
             */
            const dateTimeToServer = function (dateTime) {
                return dateTime.format("YYYY-MM-DD HH:mm:ss");
            };

            /**
             * Convert array of object with id attribute to dictionary by theirs id attributes.
             * @param array
             * @return {{}}
             */
            const arrayToIdDictionary = function (array) {
                var retDict = {};
                angular.forEach(array, function (obj) {
                    const objId = angular.copy(obj.id);
                    delete obj.id;
                    retDict[objId] = obj;
                });
                return retDict;
            };

            /**
             * Convert dictionary of object with id as their key to array of objects with id as their attribute.
             * @param dict
             * @return {Array}
             */
            const idDictionaryToArray = function (dict) {
                var retArr = [];
                angular.forEach(dict, function (obj, objId) {
                    const retObj = angular.copy(obj);
                    retObj['id'] = parseInt(objId);
                    retArr.push(retObj);
                });
                return retArr;
            };

            return {
                'dateFromServer': dateFromServer,
                'dateToServer': dateToServer,
                'dateTimeFromServer': dateTimeFromServer,
                'dateTimeToServer': dateTimeToServer,
                'arrayToIdDictionary': arrayToIdDictionary,
                'idDictionaryToArray': idDictionaryToArray
            };
        }]);