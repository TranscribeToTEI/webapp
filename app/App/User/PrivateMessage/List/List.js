'use strict';

angular.module('transcript.app.user.private-message.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.private-message.list', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/User/PrivateMessage/List/List.html',
                    controller: 'AppUserPrivateMessageListCtrl'
                }
            },
            url: '/list/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: user.id})',
                label: 'Messages privés'
            },
            tfMetaTags: {
                title: 'Liste des messages | Messagerie',
            },
            resolve: {
                threads: function(CommentService) {
                    return CommentService.getThreadsBySelfUser();
                },
                iUser: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().id, "full");
                }
            }
        })
    }])

    .controller('AppUserPrivateMessageListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'UserService', 'threads', 'iUser', function($log, $rootScope, $scope, $http, $sce, $state, flash, UserService, threads, iUser) {
        $scope.threads = threads;
        $log.debug($scope.threads);
        $scope.iUser = iUser;
        $scope.UserService = UserService;

        for(let idThread in $scope.threads) {
            let thread = $scope.threads[idThread];
            let info = thread.id.split('-');
            if(parseInt(info[1]) === $scope.iUser.id) {
                thread.iUser = info[1];
            } else {
                thread.recipient = info[1];
            }

            if(parseInt(info[2]) === $scope.iUser.id) {
                thread.iUser = info[2];
            } else {
                thread.recipient = info[2];
            }
        }
    }])
;