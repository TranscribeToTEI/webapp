'use strict';

angular.module('transcript.service.hosting-organization', ['ui.router'])

    .service('HostingOrganizationService', function($log, $http, $rootScope, $sce) {
        return {
            getOrganizations: function(profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "?profile="+profile;
                }

                return $http.get(
                    $rootScope.api+"/hosting-organizations"+profileStr
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getOrganization: function(id, profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "?profile="+profile;
                }

                return $http.get(
                    $rootScope.api+"/hosting-organizations/"+id+profileStr
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