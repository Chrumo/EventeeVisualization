/**
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').config([
    'RestangularProvider',
    function (RestangularProvider) {

        RestangularProvider.setBaseUrl('https://eventee.co/api_development');
        RestangularProvider.setDefaultHeaders({
            'email': 'tomas.hruso@gmail.com',
            'token': '24a2588cab0ca8d319e684e0d26001d17cc74870',
            'Content-Type': 'application/json'
        });
    }
])
    .run([
        '$log',
        'Restangular',
        function ($log, Restangular) {
            Restangular.addRequestInterceptor(function (element, method, name) {
                $log.debug(method + " " + name + ": start");
                $log.debug(element);
                return element;
            });
            Restangular.addResponseInterceptor(function (data, method, name) {
                $log.debug(method + " " + name + ": success");
                $log.debug(data);
                return data;
            });
            Restangular.addErrorInterceptor(function (data) {
                $log.debug(data.config.method + " " + data.config.url + ": error");
                $log.debug(data.data);
                return data.data;
            });
        }
    ]);