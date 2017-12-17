'use strict';

angular.module('transcript.service.hosting-organization', ['ui.router'])

    .service('HostingOrganizationService', function($log, $http, $rootScope, $sce) {
        return {
            getOrganizations: function() {
                return $http.get(
                    $rootScope.api+"/hosting-organizations"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getOrganization: function(id) {
                return $http.get(
                    $rootScope.api+"/hosting-organizations/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            }
        };
    })

;