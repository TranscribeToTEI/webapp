'use strict';

angular.module('transcript.admin.comments', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.comments', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/Comments/Comments.html',
                        controller: 'AdminCommentsCtrl'
                    }
                },
                url: '/commentaires',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.home',
                    label: 'Flux de commentaires'
                },
                tfMetaTags: {
                    title: 'Flux de commentaires | Administration',
                },
                resolve: {
                    logs: function(CommentLogService) {
                        return CommentLogService.getLogs();
                    }
                }
            })
    }])

    .controller('AdminCommentsCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$transition$', 'CommentLogService', 'logs', function($log, $rootScope, $scope, $http, $sce, $state, $filter, $transition$, CommentLogService, logs) {
        $scope.logContainers = logs;
        console.log($scope.logContainers);

        $scope.getLink = function(log) {
            console.log(log._embedded.content.type);
            if(log._embedded.content.type === "content") {
                $state.go('transcript.app.content', {id: log._embedded.content.id});
            } else if(log._embedded.content.type === "edition") {
                $state.go('transcript.app.edition', {idResource: log._embedded.content.id, idEntity: log._embedded.content.entity});
            } else if(log._embedded.content.type === "entity") {
                $state.go('transcript.app.entity', {id: log._embedded.content.id});
            } else if(log._embedded.content.type === "military-unit") {
                $state.go('transcript.app.taxonomy.view', {id: log._embedded.content.id, type: "military-units"});
            } else if(log._embedded.content.type === "place") {
                $state.go('transcript.app.taxonomy.view', {id: log._embedded.content.id, type: "places"});
            } else if(log._embedded.content.type === "testator") {
                $state.go('transcript.app.taxonomy.view', {id: log._embedded.content.id, type: "testators"});
            } else if(log._embedded.content.type === "trainingContent") {
                $state.go('transcript.admin.training.view', {id: log._embedded.content.id});
            }
        };

        $scope.read = function(id) {
            patch(id, true);
        };

        $scope.notRead = function(id) {
            patch(id, false);
        };

        function patch(id, read) {
            return $http.patch(
                $rootScope.api+"/comment-logs/"+id, {isReadByAdmin: read}
            ).then(function(response) {
                $filter('filter')($scope.logContainers, {id: id})[0].isReadByAdmin = read;
                return response.data;
            }, function errorCallback(response) {
                $log.debug(response);
                return response;
            });
        }

    }])
;