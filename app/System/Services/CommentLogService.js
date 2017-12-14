'use strict';

angular.module('transcript.service.comment-log', ['ui.router'])

    .service('CommentLogService', function($log, $http, $rootScope, $sce, $filter) {
        return {
            getLogs: function(readByAdmin, count) {
                let extra = [];
                let extraStr = "";
                if(readByAdmin !== undefined) {
                    extra.push("readByAdmin="+readByAdmin);
                }
                if(count !== undefined) {
                    extra.push("count="+count);
                }
                if(extra.length > 0) {extraStr += "?"+extra.join('&');}

                return $http.get(
                    $rootScope.api+"/comment-logs"+extraStr
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
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