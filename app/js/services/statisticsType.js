/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').service('statisticsTypeService',
    [
        '$log',
        'statisticsType',
        function ($log, statisticsType) {
            $log.debug("statisticsTypeService initialized");

            const getName = function(type) {
                switch (type) {
                    case statisticsType.IOS:
                        return "iOS";
                    case statisticsType.ANDROID:
                        return "Android";
                    case statisticsType.REVIEWS:
                        return "Reviews";
                    case statisticsType.RATING:
                        return "Rating";
                    case statisticsType.HALLS:
                        return "Halls";
                    case statisticsType.SESSIONS:
                        return "Sessions";
                    case statisticsType.NEWS_FEEDS:
                        return "News feed";
                }
            };

            const getSortAttribute = function(type) {
                switch (type) {
                    case statisticsType.IOS:
                        return "iOS";
                    case statisticsType.ANDROID:
                        return "android";
                    case statisticsType.REVIEWS:
                        return "reviews";
                    case statisticsType.RATING:
                        return "rating";
                    case statisticsType.HALLS:
                        return "halls";
                    case statisticsType.SESSIONS:
                        return "sessions";
                    case statisticsType.NEWS_FEEDS:
                        return "newsFeed";
                }
                return type;
            };

            const getStatusTranslation = function(status) {
                switch (status) {
                    case "HIDDEN":
                        return "Hidden";
                    case "IN_REVIEW":
                        return "In review";
                    case "PUBLIC":
                        return "Public";
                }
            };

            return {
                'getName': getName,
                'getSortAttribute': getSortAttribute,
                'getStatusTranslation': getStatusTranslation
            };
        }]);