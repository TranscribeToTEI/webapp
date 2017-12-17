'use strict';

angular.module('transcript.system.comment', ['ui.router'])
    .controller('SystemCommentCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$timeout', 'CommentService', 'thread',  function($log, $rootScope, $scope, $http, $sce, $state, $timeout, CommentService, thread) {
        $scope.threadContainer = thread;
        $log.debug($scope.threadContainer);

        $scope.comment = {
            action: {
                loading: false,
                success: false
            },
            form: {
                content: null
            },
            edit: {
                loading: false
            }
        };
        $scope.admin = {};
        $scope.editContent = {};

        $scope.comment.action.post = function() {
            $scope.comment.action.loading = true;
            $http.post($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments',
                {
                    "fos_comment_comment":
                    {
                        "body": $scope.comment.form.content
                    }
                })
                .then(function (response) {
                    $http.get($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments')
                        .then(function (response) {
                            //$log.debug(response.data);
                            $scope.threadContainer = response.data;
                            $scope.comment.form.content = "";
                            $scope.comment.action.loading = false;
                            $scope.comment.action.success = true;
                            $timeout(function() {
                                $scope.comment.action.success = false;
                            }, 5000);
                            }
                        );
                }, function errorCallback(response) {
                    $log.debug(response);
                    $scope.comment.action.loading = false;
                }
            );
        };

        $scope.comment.edit.load = function(id) {
            for(let iC in $scope.threadContainer.comments) {
                if($scope.threadContainer.comments[iC].comment.id === id) {
                    $scope.threadContainer.comments[iC].editAction = true;
                    $scope.editContent[id] = $scope.threadContainer.comments[iC].comment.body;
                }
            }
        };

        $scope.comment.edit.action = function(id) {
            $scope.comment.edit.loading = true;
            $http.put($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments/'+id,
                {
                    "fos_comment_comment":
                        {
                            "body": $scope.editContent[id]
                        }
                })
                .then(function (response) {
                    $scope.comment.edit.loading = false;
                    $log.debug(response);
                    for(let iC in $scope.threadContainer.comments) {
                        if($scope.threadContainer.comments[iC].comment.id === id) {
                            delete $scope.threadContainer.comments[iC].editAction;
                            $scope.threadContainer.comments[iC].comment.body = $scope.editContent[id];
                        }
                    }
                    delete $scope.editContent[id];
                });
        };

        $scope.options = {
            language: 'fr',
            allowedContent: true,
            entities: false,
            height: '140px',
            removePlugins: 'elementspath',
            resize_enabled: false,
            toolbar: [
                ['Bold','Italic','Underline','StrikeThrough','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','NumberedList','BulletedList','-','Link','-','Undo','Redo']
            ]
        };

        /* Cette function ne marche pas*/
        $scope.admin.remove = function(id) {
            $http.patch($rootScope.api+'/threads/'+$scope.threadContainer.thread.id+'/comments/'+id+'/state',
                {"fos_comment_delete_comment":
                    {
                        "state": 1
                    }
                })
                .then(function (response) {
                    $log.debug(response);
                    for(let iC in $scope.threadContainer.comments) {
                        if($scope.threadContainer.comments[iC].comment.id === id) {
                            $scope.threadContainer.comments[iC].comment.state = 1;
                        }
                    }
                }, function errorCallback(response) {
                    $log.debug(response);
                    $scope.comment.action.loading = false;
                });
        }
    }])
;