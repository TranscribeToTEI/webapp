'use strict';

angular.module('transcript.service.log', ['ui.router'])

    .service('LogService', function($http, $rootScope, $sce, $filter) {
        return {
            getLogs: function(entityTypes) {
                return $http.get(
                    $rootScope.api+"/logs?entityTypes="+entityTypes
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getLog: function(entityType, id) {
                return this.getLogs(entityType).then(function(data) {
                    let results = $filter('filter')(data, {'log.id': id});

                    if(results.length === 0) {
                        return null;
                    } else {
                        return results[0];
                    }
                });
            }
        };
    })

;