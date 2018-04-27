'use strict';

angular.module('transcript.service.contributor', ['ui.router'])

    .service('ContributorService', function($log, $http, $rootScope, $sce, $filter) {
        return {
            getContributors: function(count) {
                let extra = [];
                let extraStr = "";
                if(count !== undefined && count != null && count !== '') {
                    extra.push("count="+count);
                }
                if(extra.length > 0) {extraStr += "?"+extra.join('&');}

                return $http.get(
                    $rootScope.api+"/top-contributors"+extraStr
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