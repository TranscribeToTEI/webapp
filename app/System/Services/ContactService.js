'use strict';

angular.module('transcript.service.contact', ['ui.router'])

    .service('ContactService', function($log, $http, $rootScope, $sce) {
        return {
            send: function(form) {
                return $http.post($rootScope.api+"/contact", form).then(function(response) {
                    return response;
                }, function errorCallback(response) {
                    $log.debug(response);
                });
            }
        };
    })

;