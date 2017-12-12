'use strict';

angular.module('transcript.service.user-preference', ['ui.router'])

    .service('UserPreferenceService', function($log, $http, $rootScope, $cookies, $state, $sce, $filter, flash) {
        return {
            getPreferences: function(id) {
                return $http.get($rootScope.api+"/preferences?user="+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },
            patchPreferences: function(form, id) {
                return $http.patch(
                    $rootScope.api+"/preferences/"+id,
                    form
                ).then(function(response) {
                    return response;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },
        };
    })

;