'use strict';

angular.module('transcript.service.entity', ['ui.router'])

    .service('EntityService', function($log, $http, $rootScope, ResourceService) {
        return {
            getEntities: function(profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "?profile="+profile;
                }

                return $http.get(
                    $rootScope.api+"/entities"+profileStr
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            getEntity: function(id) {
                return $http.get(
                    $rootScope.api+"/entities/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            postEntity: function(data) {
                return $http.post($rootScope.api+"/entities", data).
                then(function(response) {
                    return response;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            removeEntity: function(id) {
                return $http.delete($rootScope.api+"/entities/"+id).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            exportEntity: function(id) {
                return $http.get(
                    $rootScope.api+"/xml?context=export&type=entity&id="+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            getContributionsNumberByUser: function(entity, user) {
                let count = 0;
                for(let idR in entity.resources) {
                    let resource = entity.resources[idR];
                    count += ResourceService.getContributionsNumberByUser(resource, user);
                }

                return count;
            },

            getContributors: function(entity) {
                let arrayContributors = [];
                for(let idR in entity.resources) {
                    let resource = entity.resources[idR];
                    arrayContributors = arrayContributors.concat(ResourceService.getContributors(resource));
                }

                // Remove duplicates
                let arrayUniqueContributors = [];
                $.each(arrayContributors, function(i, el){
                    if($.inArray(el, arrayUniqueContributors) === -1) arrayUniqueContributors.push(el);
                });
                return arrayUniqueContributors;
            }
        };
    })
;