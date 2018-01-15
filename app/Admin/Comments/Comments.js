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
        $log.debug($scope.logContainers);

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