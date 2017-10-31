'use strict';

angular.module('transcript.service.transcript-log', ['ui.router'])

    .service('TranscriptLogService', function($http, $rootScope, $sce, $filter) {
        return {
            getTranscriptLogs: function() {
                return $http.get(
                    $rootScope.api+"/transcript-logs"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getTranscriptLog: function(id) {
                return $http.get(
                    $rootScope.api+"/transcript-logs/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            postTranscriptLog: function(data) {
                return $http.post(
                    $rootScope.api+"/transcript-logs", data
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            patchTranscriptLog: function(data, id) {
                return $http.patch(
                    $rootScope.api+"/transcript-logs/"+id, data
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            isOpenedTranscript: function(idTranscript) {
                return $http.get(
                    $rootScope.api+"/transcript-logs?transcript="+idTranscript+"&isOpened=true"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

        };
    })

;