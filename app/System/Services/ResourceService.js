'use strict';

angular.module('transcript.service.resource', ['ui.router'])

    .service('ResourceService', function($log, $http, $rootScope, $filter) {
        return {
            getResource: function(id_resource) {
                return $http.get($rootScope.api+"/resources/"+id_resource
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },

            getResourceIntern: function(entity, idResource) {
                let resource = null;
                for(let idR in entity.resources) {
                    if(entity.resources[idR]['id'] === idResource) {
                        resource = entity.resources[idR];
                        break;
                    }
                }
                return resource;
            },

            postResource: function(resource) {
                return $http.post($rootScope.api+"/resources", resource).
                then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },

            getContributionsNumberByUser: function(resource, user) {
                let count = 0;
                for(let idV in resource['transcript']['_embedded']['version']) {
                    let version = resource['transcript']['_embedded']['version'][idV];
                    if(version['username'] === user.email) {
                        count++;
                    }
                }

                return count;
            },

            getContributors: function(resource) {
                let arrayContributors = [];
                for(let idV in resource['transcript']['_embedded']['version']) {
                    let version = resource['transcript']['_embedded']['version'][idV];
                    if(!$filter('contains')(arrayContributors, version['username'])) {
                        arrayContributors.push(version['username']);
                    }
                }

                return arrayContributors;
            }
        };
    })
;