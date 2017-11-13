'use strict';

angular.module('transcript.admin.comments', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.comments', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Comments/Comments.html',
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

    .controller('AdminCommentsCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$transition$', 'CommentLogService', 'logs', function($rootScope, $scope, $http, $sce, $state, $transition$, CommentLogService, logs) {
        $scope.logContainers = logs;
        console.log($scope.logContainers);
    }])
;