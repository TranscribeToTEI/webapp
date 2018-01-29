'use strict';

angular.module('transcript.app.blog', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.blog', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Blog/Blog.html',
                    controller: 'AppBlogCtrl'
                }
            },
            url: '/blog',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Actualités'
            },
            tfMetaTags: {
                title: 'Actualités',
            },
            resolve: {
                contents: function(ContentService) {
                    return ContentService.getContents("blogContent", "public", "DESC", null, 100, 'id,summary');
                }
            }
        })
    }])

    .controller('AppBlogCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'contents', function($log, $rootScope, $scope, $http, $sce, $state, contents) {
       $scope.contents = contents;

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Pagination system */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.itemsPerPage = 100;
        $scope.$watch('contents', function() {
            $scope.totalItems = $scope.contents.length;
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