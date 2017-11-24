'use strict';

angular.module('transcript.service.data-interface', ['ui.router'])

    .service('DataInterfaceService', function($http, $rootScope, $sce) {
        return {
            getTranscript: function(idEntity, idResource, idTranscript) {
                return $http.get($rootScope.api+"/interface/transcript/"+idEntity+"/"+idResource+"/"+idTranscript).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                });
            }
        };
    })

;