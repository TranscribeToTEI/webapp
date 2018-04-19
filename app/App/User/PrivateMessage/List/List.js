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
                iUser: function(UserService, $transition$, $rootScope) {
                    if($rootScope.user.id !== $transition$.params().id) {
                        return UserService.getUser($transition$.params().id, 'id,userProfile,userEmail,privateMessages');
                    } else {
                        return $rootScope.user;
                    }
                },
                users: function(UserService) {
                    return UserService.getUsers('id,name');
                },
                logs: function(CommentLogService, $transition$) {
                    return CommentLogService.getLogs(null, null, $transition$.params().id);
                }
            }
        })
    }])

    .controller('AppUserPrivateMessageListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'flash', 'UserService', 'threads', 'iUser', 'users', 'logs', function($log, $rootScope, $scope, $http, $sce, $state, $filter, flash, UserService, threads, iUser, users, logs) {
        $scope.threads = threads;
        $scope.iUser = iUser;console.log($scope.iUser);
        $scope.UserService = UserService;
        $scope.users = users; console.log($scope.users);
        $scope.logs = logs;
        $scope.recipient = null;

        $scope.goToThread = function() {
            $('#list-users-modal').modal('hide');
            $state.go("transcript.app.user.private-message.thread", {idUser: $scope.iUser.id, idRecipient: $scope.recipient.originalObject.id});
        };

        for(let idThread in $scope.threads) {
            let thread = $scope.threads[idThread];
            let info = thread.id.split('-');
            if(parseInt(info[1]) === $scope.iUser.id) {
                thread.iUser = info[1];
            } else {
                thread.recipient = $filter('filter')($scope.users, {id: info[1]})[0];
            }

            if(parseInt(info[2]) === $scope.iUser.id) {
                thread.iUser = info[2];
            } else if(parseInt(info[2]) === 0) {
                thread.recipient = {
                    id: 0,
                    name: 'Testaments de Poilus'
                };
            } else {
                thread.recipient = $filter('filter')($scope.users, {id: info[2]})[0];
            }

            thread.logs = $filter('filter')($scope.logs, {thread: {id: thread.id}})
        }
        console.log($scope.threads);
    }])
;