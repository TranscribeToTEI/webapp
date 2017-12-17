'use strict';

angular.module('transcript.service.transcript-log', ['ui.router'])

    .service('TranscriptLogService', function($log, $http, $rootScope, $sce, $filter) {
        return {
            getTranscriptLogs: function() {
                return $http.get(
                    $rootScope.api+"/transcript-logs"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getTranscriptLog: function(id) {
                return $http.get(
                    $rootScope.api+"/transcript-logs/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            postTranscriptLog: function(data) {
                return $http.post(
                    $rootScope.api+"/transcript-logs", data
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            patchTranscriptLog: function(data, id) {
                return $http.patch(
                    $rootScope.api+"/transcript-logs/"+id, data
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            isCurrentlyEditedTranscript: function(idTranscript) {
                return $http.get(
                    $rootScope.api+"/transcript-logs?transcript="+idTranscript+"&isCurrentlyEdited=true"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

        };
    })

;