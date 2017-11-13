'use strict';

angular.module('transcript.service.comment-log', ['ui.router'])

    .service('CommentLogService', function($http, $rootScope, $sce, $filter) {
        return {
            getLogs: function() {
                return $http.get(
                    $rootScope.api+"/comment-logs"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getLogsBy: function(entityTypes) {
                return $http.get(
                    $rootScope.api+"/comment-logs?entityTypes="+entityTypes
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