/**
 * Service managing filtering of lectures.
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').service('filterService',
    [
        '$log',
        'event',
        'filter',
        function ($log, event, filter) {
            $log.debug("filterService initialized");

            /**
             * Return true if some day is selected.
             * @return {boolean}
             * @private
             */
            const _someDaySelected = function() {
                var selected = false;
                angular.forEach(filter.days, function(day) {
                    if(day) {
                        selected = true;
                    }
                });
                return selected;
            };

            /**
             * Return true if some hall is selected.
             * @return {boolean}
             * @private
             */
            const _someHallSelected = function() {
                var selected = false;
                angular.forEach(filter.halls, function(hall) {
                    if(hall) {
                        selected = true;
                    }
                });
                return selected;
            };

            /**
             * Get selected lectures ids from given day and hall.
             * @param order - Day order, if not set, all days are checked
             * @param hallId - Hall id, if not set, all halls are checked
             * @return {Array}
             * @private
             */
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

            /**
             * Return true if some lecture is selected.
             * @param lecturesIds
             * @return {boolean}
             * @private
             */
            const _isSomeSelected = function(lecturesIds) {
                var selected = false;
                angular.forEach(lecturesIds, function (lectureId) {
                    if(filter.lectures[lectureId]) {
                        selected = true;
                    }
                });
                return selected;
            };

            /**
             * Return true if all lectures are selected.
             * @param lecturesIds
             * @return {boolean}
             * @private
             */
            const _areAllSelected = function(lecturesIds) {
                var selected = true;
                angular.forEach(lecturesIds, function (lectureId) {
                    if(!filter.lectures[lectureId]) {
                        selected = false;
                    }
                });
                return selected;
            };

            /**
             * Synchronize all, days and halls filters based on selected lectures.
             * @private
             */
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

            /**
             * Add new lecture to correct day and hall to the filter.
             * @param order - Day order
             * @param hallId - Hall id
             * @param lectureId
             */
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

            /**
             * Select or deselect all lectures.
             */
            const toggleAll = function() {
                angular.forEach(filter.lectures, function(lecture, lectureId) {
                    filter.lectures[lectureId] = filter.all;
                });
                _refreshFilter();
            };

            /**
             * Select or deselect all lectures within one day.
             * @param order - Day order
             */
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

            /**
             * Select or deselect all lectures within one hall.
             * @param hallId - Hall id
             */
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

            /**
             * Select or deselect one lecture.
             * @param lectureId - Lecture id.
             */
            const toggleLecture = function(lectureId) {
                filter.lectures[lectureId] = !filter.lectures[lectureId];
                _refreshFilter();
            };

            /**
             * Return true if all lectures within given day and hall are selected.
             * @param order - Day order
             * @param hallId - Hall id
             * @return {boolean}
             */
            const isSelected = function(order, hallId) {
                return _areAllSelected(_getLecturesIds(order, hallId));
            };

            /**
             * Return true if at least one lecture within given day and hall is selected.
             * @param order - Day order
             * @param hallId - Hall id
             * @return {boolean}
             */
            const isSomeSelected = function(order, hallId) {
                return _isSomeSelected(_getLecturesIds(order, hallId));
            };

            /**
             * Get all selected lectures ids.
             * @param order - Day order.
             * @param hallId - Hall id.
             * @return {Array}
             */
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

            /**
             * Return true if lecture with lectureId as id is selected.
             * @param lectureId
             * @return {*}
             */
            const isLectureSelected = function(lectureId) {
                return filter.lectures[lectureId];
            };

            /**
             * Deselect all lectures and clear filter value.
             */
            const clear = function () {
                filter.all = false;
                angular.forEach(filter.days, function (d, i) {
                    delete filter.days[i];
                });
                angular.forEach(filter.halls, function (h, i) {
                    delete filter.halls[i];
                });
                angular.forEach(filter.lectures, function (l, i) {
                    delete filter.lectures[i];
                });
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
                'isLectureSelected': isLectureSelected,
                'clear': clear
            };
        }]);