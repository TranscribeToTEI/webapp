'use strict';

angular.module('transcript.service.content', ['ui.router'])

    .service('ContentService', function($log, $http, $rootScope, $sce) {
        return {
            getContents: function(type, status, date, order, limit, profile) {
                let typeContainer = "",
                    statusContainer = "",
                    dateContainer = "",
                    orderContainer = "",
                    limitContainer = "",
                    profileContainer = "",
                    arrayContainer = [];

                if(type !== null) {typeContainer = "type="+type; arrayContainer.push(typeContainer);}
                if(status !== null) {statusContainer = "status="+status; arrayContainer.push(statusContainer);}
                if(date !== null) {dateContainer = "date="+date; arrayContainer.push(dateContainer);}
                if(order !== null) {orderContainer = "order="+order; arrayContainer.push(orderContainer);}
                if(limit !== null) {limitContainer = "limit="+limit; arrayContainer.push(limitContainer);}
                if(profile !== null) {profileContainer = "profile="+profile; arrayContainer.push(profileContainer);}
                let query = arrayContainer.join("&");

                return $http.get(
                    $rootScope.api+"/contents?"+query
                ).then(function(response) {
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