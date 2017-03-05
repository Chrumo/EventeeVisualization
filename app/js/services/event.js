/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').service('eventService', [
    '$log',
    '$q',
    'Restangular',
    'filterService',
    'helperService',
    'converterFactory',
    'event',
    function($log, $q, Restangular, filterService, helperService, converterFactory, event) {
        $log.debug("eventService initialized");

        const _getEventData = function(id, callback) {
            Restangular.one('event', id).get().then(function(eventFS) {
                callback(eventFS);
            });
        };

        const _getContent = function(id, callback) {
            _getEventData(id, function(eventFS) {
                const startDate = converterFactory.dateFromServer(eventFS.startDate);
                var date = startDate.clone();
                const endDate = converterFactory.dateFromServer(eventFS.endDate);
                var data = {};
                var promises = [];
                while(date.isSameOrBefore(endDate)) {
                    promises.push(Restangular.all('all').get('', {
                        'date': date.format('YYYY-MM-DD')
                    }, {
                        confId: id
                    }).then(function(dataFS) {
                        dataFS.date = converterFactory.dateFromServer(dataFS.date);
                        var order = dataFS.date.diff(startDate, 'd') + 1;
                        data[order + ""] = {
                            'date': dataFS.date,
                            'dayOfWeek': dataFS.date.format('dddd'),
                            'halls': {}
                        };
                        angular.forEach(dataFS.halls, function(hall) {
                            if(typeof data[order].halls[hall.id] === 'undefined') {
                                data[order].halls[hall.id] ={
                                    'name': hall.name,
                                    'lectures': {}
                                };
                            }
                            angular.forEach(hall.lectures, function(lecture) {
                                data[order].halls[lecture.hallId].lectures[lecture.id] = {
                                    'name': lecture.name,
                                    'start': converterFactory.dateTimeFromServer(lecture.start),
                                    'end': converterFactory.dateTimeFromServer(lecture.end),
                                    'ratings': []
                                };
                            });
                        });
                    }));
                    date.add(1, 'd');
                }
                $q.all(promises).then(function() {
                    callback(data);
                });
            });
        };

        const _getRatings = function(eventId, lectureId, callback) {
            return Restangular.one('lecture', lectureId).all('ratings').get('', {}, {
                confId: eventId
            }).then(function(data) {
                callback(data);
            });
        };

        const _getLecture = function(lectureId) {
            var retLecture = {};
            angular.forEach(event, function(day) {
                angular.forEach(day.halls, function(hall) {
                    angular.forEach(hall.lectures, function(lecture, lecId) {
                        if(parseInt(lectureId) === parseInt(lecId)) {
                            retLecture = lecture;
                        }
                    });
                });
            });
            return retLecture;
        };

        const getDataAsync = function(id, callback) {
            $log.debug('eventService.getDataAsync(' + typeof id + ' ' + id + ', ' + typeof callback + ')');
            _getContent(id, function(data) {
                var promises = [];
                angular.forEach(data, function(day, order) {
                    angular.forEach(day.halls, function(hall, hallId) {
                        angular.forEach(hall.lectures, function(lecture, lectureId) {
                            helperService.setHallStart(order, lecture.start);
                            helperService.setHallEnd(order, lecture.end);
                            filterService.addNewLecture(order, hallId, lectureId);
                            promises.push(_getRatings(id, lectureId, function(ratings) {
                                lecture.ratings = [];
                                angular.forEach(ratings, function(rating) {
                                    const datetime = converterFactory.dateTimeFromServer(rating.timestamp);
                                    if(datetime.isSameOrAfter(lecture.start)) {
                                        lecture.ratings.push({
                                            'id': +rating.id,
                                            'time': datetime,
                                            // 'rating': +rating.stars,
                                            'comment': rating.comment
                                        });
                                    }
                                });
                                helperService.setMaxNumberOfRatings(lecture.ratings.length);
                            }));
                        });
                    })
                });
                $q.all(promises).then(function() {
                    angular.forEach(data, function(attr, attrId) {
                        event[attrId] = angular.copy(attr);
                    });
                    callback(data);
                });
            });
        };

        const getDaysAsArray = function() {
            var retArr = [];
            angular.forEach(event, function(day, order) {
                retArr.push({
                    'date': day.date.format('Do. MMM. YYYY'),
                    'order': order
                });
            });

            return retArr;
        };

        const getHallsAsArray = function() {
            var retArr = [];
            angular.forEach(event, function(day) {
                angular.forEach(day.halls, function(hall, hallId) {
                    if(!retArr.find(function(item) {
                        return parseInt(item.id) === parseInt(hallId);
                        })) {
                        retArr.push({
                            'id': hallId,
                            'name': hall.name
                        });
                    }
                });
            });

            return retArr;
        };

        const getHallInsightData = function(day, hallId) {
            $log.debug('eventService.getHallInsightData(' + typeof day + ' ' + day + ', ' +
                typeof hallId + ' ' + hallId + ')');
            if(!angular.isDefined(event[day]) && !angular.isDefined(event[day].halls[hallId])) {
                $log.error('Not known hall with id=' + hallId + ' in day ' + day);
                return {};
            }
            var retArr = {
                'lectures': [],
                'maxVal': helperService.getMaxNumberOfRatings(),
                'start': helperService.getHallStart(day),
                'end': helperService.getHallEnd(day)
            };
            var lectures = event[day].halls[hallId].lectures;
            angular.forEach(lectures, function(lecture, lectureId) {
                retArr.lectures.push({
                    'id': lectureId,
                    'start': lecture.start,
                    'end': lecture.end,
                    'value': lecture.ratings.length
                });
            });
            retArr.lectures.sort(function(a, b) {
                return a.start.diff(b.start);
            });
            return retArr;
        };

        const getLectureData = function(lectureIds) {
            $log.debug('eventService.getLectureData(' + typeof lectureIds + ' ' + lectureIds + ')');
            if(angular.isUndefined(lectureIds)) {
                $log.error('Not known lectures with id=' + lectureIds);
                return {};
            }
            if(!angular.isArray(lectureIds)) {
                lectureIds = [ lectureIds ];
            }
            var retArr = {};
            angular.forEach(lectureIds, function(lectureId) {
                var lecture = _getLecture(lectureId);
                retArr[lectureId] = {
                    "name": lecture.name,
                    "start": lecture.start,
                    "end": lecture.end,
                    "data": []
                };
                var ratings = [{
                    'id': 0,
                    'value': 0,
                    'rating': 0,
                    'datetime': lecture.start
                }];
                angular.forEach(lecture.ratings, function(rating) {
                    ratings.push({
                        'id': rating.id,
                        'rating': rating.rating,
                        'datetime': rating.time
                    });
                });
                ratings = ratings.sort(function(a, b) {
                    return a.datetime.diff(b.datetime);
                });
                angular.forEach(ratings, function (rating, index) {
                    rating.value = index;
                });
                if(ratings.length === 1) {
                    ratings.push({
                        'id': 0,
                        'value': 0,
                        'rating': 0,
                        'datetime': lecture.end
                    });
                }
                retArr[lectureId].data = ratings;
            });
            return retArr;
        };

        const getHallAndDay = function(lectureId) {
            var retVal = {};
            angular.forEach(event, function (day, order) {
                angular.forEach(day.halls, function (hall, hallId) {
                    angular.forEach(hall.lectures, function (lecture, lecId) {
                        if(+lectureId === +lecId) {
                            retVal = {
                                'hall': hallId,
                                'day': order
                            }
                        }
                    })
                });
            });
            return retVal;
        };

        return {
            'getDataAsync': getDataAsync,
            'getDaysAsArray': getDaysAsArray,
            'getHallsAsArray': getHallsAsArray,
            'getHallInsightData': getHallInsightData,
            'getLectureData': getLectureData,
            'getHallAndDay': getHallAndDay
        }
    }
]);