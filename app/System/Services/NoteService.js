'use strict';

angular.module('transcript.service.note', ['ui.router'])

    .service('NoteService', function($log, $http, $rootScope, $filter) {
        return {
            getNotes: function() {
                return $http.get($rootScope.api+"/notes"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },

            getNotesByTranscript: function(id_transcript) {
                return $http.get($rootScope.api+"/notes?transcript="+id_transcript
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },

            getNote: function(id) {
                return $http.get($rootScope.api+"/notes/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },

            postNote: function(data) {
                return $http.post($rootScope.api+"/notes", data
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },

            patchNote: function(id, data) {
                return $http.patch($rootScope.api+"/notes/"+id, data
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.log(response);
                    return response;
                });
            },
        };
    })
;