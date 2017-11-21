'use strict';

angular.module('transcript.service.will-type', ['ui.router'])

    .service('WillTypeService', function($http, $rootScope) {
        return {
            getTypes: function() {
                return $http.get($rootScope.api+"/will-types").
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getType: function(id) {
                return $http.get($rootScope.api+"/will-types/"+id).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            }
        };
    })
;