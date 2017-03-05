/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').service('filterService',
    [
        '$log',
        'event',
        'filter',
        function ($log, event, filter) {
            $log.debug("filterService initialized");

            const _someDaySelected = function() {
                var selected = false;
                angular.forEach(filter.days, function(day) {
                    if(day) {
                        selected = true;
                    }
                });
                return selected;
            };

            const _someHallSelected = function() {
                var selected = false;
                angular.forEach(filter.halls, function(hall) {
                    if(hall) {
                        selected = true;
                    }
                });
                return selected;
            };

            const _getLecturesIds = function (order, hallId) {
                var retArr = [];
                angular.forEach(event, function (day, o) {
                    if(angular.isUndefined(order) || parseInt(order) === parseInt(o)) {
                        angular.forEach(day.halls, function (hall, hId) {
                            if(angular.isUndefined(hallId) || parseInt(hallId) === parseInt(hId)) {
                                angular.forEach(hall.lectures, function (lecture, lectureId) {
                                    retArr.push(parseInt(lectureId));
                                });
                            }
                        });
                    }
                });
                return retArr;
            };

            const _isSomeSelected = function(lecturesIds) {
                var selected = false;
                angular.forEach(lecturesIds, function (lectureId) {
                    if(filter.lectures[lectureId]) {
                        selected = true;
                    }
                });
                return selected;
            };

            const _areAllSelected = function(lecturesIds) {
                var selected = true;
                angular.forEach(lecturesIds, function (lectureId) {
                    if(!filter.lectures[lectureId]) {
                        selected = false;
                    }
                });
                return selected;
            };

            const _refreshFilter = function() {
                var isAllSelected = true;
                angular.forEach(filter.days, function (day, order) {
                    var isSomeHallSelected = false;
                    angular.forEach(filter.halls, function(hall, hallId) {
                        if(_areAllSelected(_getLecturesIds(order, hallId))) {
                            isSomeHallSelected = true;
                        } else {
                            isAllSelected = false;
                        }
                    });
                    filter.days[order] = isSomeHallSelected;
                });
                angular.forEach(filter.halls, function (hall, hallId) {
                    var isSomeDaySelected = false;
                    angular.forEach(filter.days, function(day, order) {
                        if(_areAllSelected(_getLecturesIds(order, hallId))) {
                            isSomeDaySelected = true;
                        }
                    });
                    filter.halls[hallId] = isSomeDaySelected;
                });
                filter.all = isAllSelected;
            };

            const addNewLecture = function(order, hallId, lectureId) {
                if(angular.isUndefined(filter.days[order])) {
                    filter.days[order] = false;
                }
                if(angular.isUndefined(filter.halls[hallId])) {
                    filter.halls[hallId] = false;
                }
                if(angular.isUndefined(filter.lectures[lectureId])) {
                    filter.lectures[lectureId] = false;
                }
            };

            const toggleAll = function() {
                angular.forEach(filter.lectures, function(lecture, lectureId) {
                    filter.lectures[lectureId] = filter.all;
                });
                _refreshFilter();
            };

            const toggleDay = function(order) {
                // filter.days[order];
                var lectures = [];
                if(_someHallSelected()) {
                    // AND
                    angular.forEach(filter.halls, function (hall, hallId) {
                        if(hall) {
                            lectures = lectures.concat(_getLecturesIds(order, hallId));
                        } else {
                            angular.forEach(_getLecturesIds(order, hallId), function (lecId) {
                                filter.lectures[lecId] = false;
                            });
                        }
                    })
                } else {
                    // OR
                    lectures = _getLecturesIds(order);
                }
                angular.forEach(lectures, function (lecId) {
                    filter.lectures[lecId] = filter.days[order];
                });
                _refreshFilter();
            };

            const toggleHall = function (hallId) {
                // filter.halls[hallId];
                var lectures = [];
                if(_someDaySelected()) {
                    // AND
                    angular.forEach(filter.days, function (day, order) {
                        if(day) {
                            lectures = lectures.concat(_getLecturesIds(order, hallId));
                        } else {
                            angular.forEach(_getLecturesIds(order, hallId), function (lecId) {
                                filter.lectures[lecId] = false;
                            });
                        }
                    })
                } else {
                    // OR
                    lectures = _getLecturesIds(undefined, hallId);
                }
                angular.forEach(lectures, function (lecId) {
                    filter.lectures[lecId] = filter.halls[hallId];
                });
                _refreshFilter();
            };

            const toggleLecture = function(lectureId) {
                filter.lectures[lectureId] = !filter.lectures[lectureId];
                _refreshFilter();
            };

            const isSelected = function(order, hallId) {
                return _areAllSelected(_getLecturesIds(order, hallId));
            };

            const isSomeSelected = function(order, hallId) {
                return _isSomeSelected(_getLecturesIds(order, hallId));
            };

            const getSelectedIds = function(order, hallId) {
                var selectedLecturesIds = [];
                const lecturesIds = _getLecturesIds(order, hallId);
                angular.forEach(lecturesIds, function (lectureId) {
                    if(filter.lectures[lectureId]) {
                        selectedLecturesIds.push(lectureId);
                    }
                });
                return selectedLecturesIds;
            };

            const isLectureSelected = function(lectureId) {
                return filter.lectures[lectureId];
            };

            return {
                'addNewLecture': addNewLecture,
                'toggleAll': toggleAll,
                'toggleDay': toggleDay,
                'toggleHall': toggleHall,
                'toggleLecture': toggleLecture,
                'isSelected': isSelected,
                'isSomeSelected': isSomeSelected,
                'getSelectedIds': getSelectedIds,
                'isLectureSelected': isLectureSelected
            };
        }]);