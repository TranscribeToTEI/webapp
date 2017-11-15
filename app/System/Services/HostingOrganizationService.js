'use strict';

angular.module('transcript.service.hosting-organization', ['ui.router'])

    .service('HostingOrganizationService', function($http, $rootScope, $sce) {
        return {
            getOrganizations: function() {
                return $http.get(
                    $rootScope.api+"/hosting-organizations"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getOrganization: function(id) {
                return $http.get(
                    $rootScope.api+"/hosting-organizations/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            }
        };
    })

;