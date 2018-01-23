'use strict';

angular.module('transcript.app.user.private-message.thread', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.app.user.private-message.thread', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/App/User/PrivateMessage/Thread/Thread.html',
                        controller: 'AppUserPrivateMessageThreadCtrl'
                    },
                    "comment@transcript.app.user.private-message.thread" : {
                        templateUrl: '/webapp/app/System/Comment/tpl/Thread.html',
                        controller: 'SystemCommentCtrl'
                    }
                },
                url: '/conversation/{idUser}/{idRecipient}',
                ncyBreadcrumb: {
                    parent: 'transcript.app.user.private-message.list({id: iUser.id})',
                    label: '{{ recipientUser.name }}'
                },
                tfMetaTags: {
                    title: 'Discussion avec {{ recipientUser.name }} | Messagerie',
                },
                resolve: {
                    thread: function(CommentService, $transition$) {
                        return CommentService.getThreadSharedByUsers($transition$.params().idUser, $transition$.params().idRecipient);
                    },
                    iUser: function(UserService, $transition$, $rootScope) {
                        if($rootScope.user.id !== $transition$.params().idUser) {
                            return UserService.getUser($transition$.params().idUser, 'id,userProfile,userEmail');
                        } else {
                            return $rootScope.user;
                        }
                    },
                    recipientUser: function(UserService, $transition$, $rootScope) {
                        if($rootScope.user.id !== $transition$.params().idRecipient) {
                            return UserService.getUser($transition$.params().idRecipient, 'id,userProfile,userEmail');
                        } else {
                            return $rootScope.user;
                        }
                    },
                    logs: function(CommentLogService, $transition$) {
                        return CommentLogService.getLogs(null, null, $transition$.params().idUser+"-"+$transition$.params().idRecipient);
                    }
                }
            })
    }])

    .controller('AppUserPrivateMessageThreadCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'flash', 'thread', 'iUser', 'recipientUser', 'logs', function($log, $rootScope, $scope, $http, $sce, $state, $filter, flash, thread, iUser, recipientUser, logs) {
        $scope.thread = thread;
        $scope.iUser = iUser;
        $scope.recipientUser = recipientUser;
        $scope.logs = logs; console.log($scope.logs);

        if($scope.thread === null || $scope.thread === undefined || $scope.thread.thread === undefined || $scope.thread.thread.id === undefined) {
            $state.reload();
            $log.debug('reload');
        }

        for(let iL in $scope.logs) {
            let log = $scope.logs[iL];
            if(log.isReadByRecipient === false && log.createUser.id !== $scope.iUser.id) {
                patch(log.id);
            }
        }

        function patch(id) {
            return $http.patch(
                $rootScope.api+"/comment-logs/"+id, {isReadByRecipient: true}
            ).then(function(response) {
                $filter('filter')($scope.logs, {id: id})[0].isReadByRecipient = true;
                $rootScope.user._embedded.unreadMessages = $rootScope.user._embedded.unreadMessages-1;
                return response.data;
            }, function errorCallback(response) {
                $log.debug(response);
                return response;
            });
        }
    }])
;