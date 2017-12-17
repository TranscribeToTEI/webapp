'use strict';

angular.module('transcript.service.training-content', ['ui.router'])

    .service('TrainingContentService', function($log, $http, $rootScope, $sce) {
        return {
            getTrainingContents: function(type, status, orderInTraining) {
                let typeContainer = "",
                    statusContainer = "",
                    orderInTrainingContainer = "",
                    arrayContainer = [];

                if(type !== null && typeof(type) !== "undefined") {typeContainer = "type="+type; arrayContainer.push(typeContainer);}
                if(status !== null && typeof(status) !== "undefined") {statusContainer = "status="+status; arrayContainer.push(statusContainer);}
                if(orderInTraining !== null && typeof(orderInTraining) !== "undefined") {orderInTrainingContainer = "orderInTraining="+orderInTraining; arrayContainer.push(orderInTrainingContainer);}
                let query = arrayContainer.join("&");

                return $http.get(
                    $rootScope.api+"/training-contents?"+query
                ).then(function(response) {
                    for(let id in response.data) {
                        if(response.data[id].content !== null) {
                            response.data[id].content = $sce.trustAsHtml(response.data[id].content);
                        }
                    }
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getTrainingContent: function(id) {
                return $http.get(
                    $rootScope.api+"/training-contents/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getTrainingContentByOrder: function(order) {
                return $http.get(
                    $rootScope.api+"/training-contents?order="+order
                ).then(function(response) {
                    if(response.data.length > 0) {
                        let content = response.data[0];
                        return content;
                    } else {
                        return null;
                    }
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            }
        };
    })

;