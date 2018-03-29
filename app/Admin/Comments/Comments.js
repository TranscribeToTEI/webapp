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
                    },
                    notRead: function(CommentLogService) {
                        return CommentLogService.getLogs(false, true);
                    }
                }
            })
    }])

    .controller('AdminCommentsCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$transition$', 'CommentLogService', 'logs', 'notRead', function($log, $rootScope, $scope, $http, $sce, $state, $filter, $transition$, CommentLogService, logs, notRead) {
        $scope.logContainers = logs;
        $scope.notReadCounter = notRead;
        console.log($scope.logContainers);

        $scope.getLink = function(log) {
            console.log(log._embedded.content.type);
            let url = "";
            if(log._embedded.content.type === "content") {
                url = $state.href('transcript.app.content', {id: log._embedded.content.id});
            } else if(log._embedded.content.type === "edition") {
                url = $state.href('transcript.app.edition', {idResource: log._embedded.content.id, idEntity: log._embedded.content.entity});
            } else if(log._embedded.content.type === "entity") {
                url = $state.href('transcript.app.entity', {id: log._embedded.content.id});
            } else if(log._embedded.content.type === "military-unit") {
                url = $state.href('transcript.app.taxonomy.view', {id: log._embedded.content.id, type: "military-units"});
            } else if(log._embedded.content.type === "place") {
                url = $state.href('transcript.app.taxonomy.view', {id: log._embedded.content.id, type: "places"});
            } else if(log._embedded.content.type === "testator") {
                url = $state.href('transcript.app.taxonomy.view', {id: log._embedded.content.id, type: "testators"});
            } else if(log._embedded.content.type === "trainingContent") {
                url = $state.href('transcript.admin.training.view', {id: log._embedded.content.id});
            }

            window.open(url,'_blank');
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

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Pagination system */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.itemsPerPage = 100;
        $scope.$watch('logContainers', function() {
            $scope.totalItems = $scope.logContainers.length;
            $scope.currentPage = 1;
        });

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function() {
            $log.debug('Page changed to: ' + $scope.currentPage);
        };
        /* ---------------------------------------------------------------------------------------------------------- */

    }])
;