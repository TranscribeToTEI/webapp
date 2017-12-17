'use strict';

angular.module('transcript.service.access', ['ui.router'])

    .service('AccessService', function($log, $http, $rootScope, $cookies, $state, $sce, flash) {
        return {
            getAccesses: function() {
                return $http.get($rootScope.api+"/accesses").
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    //if()
                    return response;
                });
            },
            getAccessByUser: function(userId) {
                return $http.get(
                    $rootScope.api+"/accesses?user="+userId
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getAccess: function(id) {
                return $http.get(
                    $rootScope.api+"/accesses/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            patchAccess: function(form, accessId) {
                return $http.patch($rootScope.api+"/accesses/"+accessId, form).
                then(function(response) {
                    $log.debug(response);
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            }
        };
    })

;