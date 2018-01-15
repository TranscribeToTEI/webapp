'use strict';

angular.module('transcript.admin.training.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.training.view', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/Training/View/View.html',
                        controller: 'AdminTrainingViewCtrl'
                    },
                    "comment@transcript.admin.training.view" : {
                        templateUrl: '/webapp/app/System/Comment/tpl/Thread.html',
                        controller: 'SystemCommentCtrl'
                    }
                },
                url: '/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.training.list',
                    label: '{{ trainingContent.title }}'
                },
                tfMetaTags: {
                    title: '{{ trainingContent.title }} | Entrainement | Administration ',
                },
                resolve: {
                    trainingContent: function(TrainingContentService, $transition$) {
                        return TrainingContentService.getTrainingContent($transition$.params().id);
                    },
                    trainingContents: function(TrainingContentService) {
                        return TrainingContentService.getTrainingContents(null, null, null);
                    },
                    thread: function(CommentService, $transition$) {
                            return CommentService.getThread('trainingContent-'+$transition$.params().id);
                    }
                }
            })
    }])

    .controller('AdminTrainingViewCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'Upload', 'trainingContent', 'trainingContents', function($log, $rootScope, $scope, $http, $sce, $state, $filter, Upload, trainingContent, trainingContents) {
        $scope.trainingContent = trainingContent;
        $scope.trainingContents = trainingContents;

        /* Compute next content & training end ---------------------------------------------------------------------- */
        $scope.nextContent = $filter('filter')($scope.trainingContents, {orderInTraining: $scope.trainingContent.orderInTraining+1});
        if($scope.nextContent.length === 0) {
            $scope.nextContent = null;
        } else {
            $scope.nextContent = $scope.nextContent[0];
        }
        $scope.previousContent = $filter('filter')($scope.trainingContents, {orderInTraining: $scope.trainingContent.orderInTraining-1});
        if($scope.previousContent.length === 0) {
            $scope.previousContent = null;
        } else {
            $scope.previousContent = $scope.previousContent[0];
        }
        /* End: Compute next content & training end ----------------------------------------------------------------- */

        /* Upload new media ----------------------------------------------------------------------------------------- */
        $scope.media = {
            form: {
                illustration: null,
                exerciseImageToTranscribe: null
            },
            submit: {
                loading: {
                    illustration: false,
                    exerciseImageToTranscribe: false
                }
            }
        };
        /* End: Upload new media ------------------------------------------------------------------------------------ */
    }])
;