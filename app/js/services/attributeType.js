/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').service('attributeTypeService',
    [
        '$log',
        'attributeType',
        function ($log, attributeType) {
            $log.debug("attributeTypeService initialized");

            const getName = function(type) {
                switch (type) {
                    case attributeType.RATINGS:
                        return "Ratings";
                    case attributeType.COMMENTS:
                        return "Comments";
                    case attributeType.LENGTH:
                        return "Length";
                    case attributeType.FAVORITES:
                        return "Favorites";
                    case attributeType.AVG_RATING:
                        return "Average rating";
                }
            };

            const getColor = function(type) {
                switch (type) {
                    case attributeType.RATINGS:
                        return "#1f77b4";
                    case attributeType.COMMENTS:
                        return "#ff7f0e";
                    case attributeType.LENGTH:
                        return "#2ca02c";
                    case attributeType.FAVORITES:
                        return "#d62728";
                    case attributeType.AVG_RATING:
                        return "#9467bd";
                }
            };

            return {
                'getName': getName,
                'getColor': getColor
            };
        }]);