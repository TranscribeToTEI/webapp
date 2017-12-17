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
                parent: function($scope) {
                    if($scope.content.type === 'blogContent') {
                        return 'transcript.app.blog';
                    } else if($scope.content.type === 'helpContent') {
                        return 'transcript.app.home';
                    } else if($scope.content.type === 'staticContent') {
                        return 'transcript.app.home';
                    }
                },
                label: '{{ content.title }}'
            },
            tfMetaTags: {
                title:  function(content) {
                    if(content.type === 'blogContent') {
                        return content.title;
                    } else if(content.type === 'helpContent') {
                        return content.title;
                    } else if(content.type === 'staticContent') {
                        return content.title;
                    }
                },
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

    .controller('AppContentCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'content', 'contents', function($log, $rootScope, $scope, $http, $sce, $state, content, contents) {
        $scope.content = content;
        $scope.contents = contents;
        $log.debug($scope.content);
    }])
;