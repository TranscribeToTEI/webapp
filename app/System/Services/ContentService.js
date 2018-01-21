'use strict';

angular.module('transcript.service.content', ['ui.router'])

    .service('ContentService', function($log, $http, $rootScope, $sce) {
        return {
            getContents: function(type, status, date, limit, onHomepage) {
                let typeContainer = "",
                    statusContainer = "",
                    dateContainer = "",
                    limitContainer = "",
                    onHomepageContainer = "",
                    arrayContainer = [];

                if(type !== null) {typeContainer = "type="+type; arrayContainer.push(typeContainer);}
                if(status !== null) {statusContainer = "status="+status; arrayContainer.push(statusContainer);}
                if(date !== null) {dateContainer = "date="+date; arrayContainer.push(dateContainer);}
                if(limit !== null) {limitContainer = "limit="+limit; arrayContainer.push(limitContainer);}
                if(onHomepage !== undefined && onHomepage !== null) {onHomepageContainer = "onhomepage="+onHomepage; arrayContainer.push(onHomepageContainer);}
                let query = arrayContainer.join("&");

                return $http.get(
                    $rootScope.api+"/contents?"+query
                ).then(function(response) {
                    for(let id in response.data) {
                        response.data[id].content = $sce.trustAsHtml(response.data[id].content);
                    }
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getContent: function(id, profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "?profile="+profile;
                }

                return $http.get(
                    $rootScope.api+"/contents/"+id+profileStr
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