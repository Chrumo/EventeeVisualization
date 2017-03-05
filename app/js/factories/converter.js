/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').factory('converterFactory',
    [
        '$log',
        function ($log) {
            $log.debug("converterFactory initialized");

            const dateFromServer = function (date) {
                return moment(date, "YYYY-MM-DD");
            };

            const dateToServer = function (date) {
                return date.format("YYYY-MM-DD");
            };

            const dateTimeFromServer = function (dateTime) {
                return moment(dateTime, "YYYY-MM-DD HH:mm:ss");
            };

            const dateTimeToServer = function (dateTime) {
                return dateTime.format("YYYY-MM-DD HH:mm:ss");
            };

            const arrayToIdDictionary = function (array) {
                var retDict = {};
                angular.forEach(array, function (obj) {
                    const objId = angular.copy(obj.id);
                    delete obj.id;
                    retDict[objId] = obj;
                });
                return retDict;
            };

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