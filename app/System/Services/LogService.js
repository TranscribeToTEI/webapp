'use strict';

angular.module('transcript.service.log', ['ui.router'])

    .service('LogService', function($log, $http, $rootScope, $sce, $filter) {
        return {
            getLogs: function(entityTypes) {
                return $http.get(
                    $rootScope.api+"/logs?entityTypes="+entityTypes
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getLogsByEntity: function(entityType, idEntity, getEntity) {
                return $http.get(
                    $rootScope.api+"/logs?entityTypes="+entityType+"&idEntity="+idEntity+"&getEntity="+getEntity
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getLog: function(entityType, idLog, getEntity) {
                return $http.get(
                    $rootScope.api+"/logs?entityTypes="+entityType+"&idLog="+idLog+"&getEntity="+getEntity
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getPreviousLog: function(entityType, idLog, getEntity) {
                return $http.get(
                    $rootScope.api+"/logs?entityTypes="+entityType+"&idLog="+idLog
                ).then(function(response) {
                    if(response.data.log.version > 1) {
                        return $http.get(
                            $rootScope.api+"/logs?entityTypes="+entityType+"&idEntity="+response.data.log.objectId+"&idVersion="+(response.data.log.version-1)+"&getEntity="+getEntity
                        ).then(function(response) {
                            return response.data;
                        }, function errorCallback(response) {
                            $log.debug(response);
                            return response;
                        });
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