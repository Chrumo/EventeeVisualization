/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma')
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/events');
            // $urlRouterProvider.otherwise('/event/124/stats');

            $stateProvider
                .state('events', {
                    url: "/events",
                    templateUrl: "views/events.html",
                    controller: "eventsCtrl"
                })
                .state('event', {
                    abstract: true,
                    url: '/event/{id:int}',
                    templateUrl: "views/layouts/event.html"
                })
                .state('event.stats', {
                    url: '/stats',
                    controller: 'StatisticsCtrl',
                    templateUrl: "views/statistics.html"
                })

        }]);