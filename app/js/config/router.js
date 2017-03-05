/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma')
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/event/124/stats');

            $stateProvider
                .state('event', {
                    abstract: true,
                    url: '/event/{id}',
                    templateUrl: "views/layouts/event.html"
                })
                .state('event.stats', {
                    url: '/stats',
                    controller: 'StatisticsCtrl',
                    templateUrl: "views/statistics.html"
                })

        }]);