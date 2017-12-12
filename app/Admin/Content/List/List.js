'use strict';

angular.module('transcript.admin.content.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.content.list', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Content/List/List.html',
                    controller: 'AdminContentListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Liste des contenus'
            },
            tfMetaTags: {
                title: 'Liste | Contenus  | Administration',
            },
            resolve: {
                contents: function(ContentService) {
                    return ContentService.getContents(null, null, "DESC", 100);
                }
            }
        })
    }])

    .controller('AdminContentListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'contents', function($log, $rootScope, $scope, $http, $sce, $state, contents) {
        $scope.contents = contents;
    }])
;