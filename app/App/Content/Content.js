'use strict';

angular.module('transcript.app.content', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.content', {
            views: {
                "page" : {
                    templateUrl: 'App/Content/Content.html',
                    controller: 'AppContentCtrl'
                },
                "comment@transcript.app.content" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            url: '/content/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.blog',
                label: '{{ content.title }}'
            },
            tfMetaTags: {
                title: '{{ content.title }}',
            },
            resolve: {
                content: function(ContentService, $transition$) {
                    return ContentService.getContent($transition$.params().id, true);
                },
                contents: function(ContentService) {
                    return ContentService.getContents("blogContent", "public", "DESC", 5);
                },
                thread: function(CommentService, $transition$) {
                    return CommentService.getThread('content-'+$transition$.params().id);
                }
            }
        })
    }])

    .controller('AppContentCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'content', 'contents', function($rootScope, $scope, $http, $sce, $state, content, contents) {
       $scope.content = content;
       $scope.contents = contents;
       console.log($scope.content);
    }])
;