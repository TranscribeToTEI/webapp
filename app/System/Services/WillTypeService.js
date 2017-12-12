'use strict';

angular.module('transcript.service.will-type', ['ui.router'])

    .service('WillTypeService', function($log, $http, $rootScope) {
        return {
            getTypes: function() {
                return $http.get($rootScope.api+"/will-types").
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },
            getType: function(id) {
                return $http.get($rootScope.api+"/will-types/"+id).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            }
        };
    })
;