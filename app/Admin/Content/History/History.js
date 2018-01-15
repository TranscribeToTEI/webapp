'use strict';

angular.module('transcript.admin.content.history', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.content.history', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/Content/History/History.html',
                        controller: 'AdminContentHistoryCtrl'
                    }
                },
                url: '/history/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.app.content({id: content.id})',
                    label: 'Historique des modifications'
                },
                tfMetaTags: {
                    title: '{{ content.title }} | Historique | Contenus  | Administration',
                },
                resolve: {
                    content: function(ContentService, $transition$) {
                        return ContentService.getContent($transition$.params().id, false);
                    }
                }
            })
    }])

    .controller('AdminContentHistoryCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$timeout', 'content', function($log, $rootScope, $scope, $http, $sce, $state, $timeout, content) {
        $scope.content = content;
        $log.debug($scope.content);
        $scope.iContent = content;

        $scope.loadVersion = function(version) {
            $log.debug(version);
            $scope.iContent = version.data;
            $scope.iContent.version = version.version;
        };
    }])
;