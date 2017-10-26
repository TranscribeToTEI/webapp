'use strict';

angular.module('transcript.admin.training.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.training.view', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Training/View/View.html',
                        controller: 'AdminTrainingViewCtrl'
                    },
                    "comment@transcript.admin.training.view" : {
                        templateUrl: 'System/Comment/tpl/Thread.html',
                        controller: 'SystemCommentCtrl'
                    }
                },
                url: '/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.training.list',
                    label: '{{ trainingContent.title }}'
                },
                tfMetaTags: {
                    title: '{{ trainingContent.title }}',
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

    .controller('AdminTrainingViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'Upload', 'trainingContent', 'trainingContents', function($rootScope, $scope, $http, $sce, $state, $filter, Upload, trainingContent, trainingContents) {
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

        /* Submit data */
        $scope.media.submit.action = function(type) {
            let picture = null;
            if(type === 'illustration') {
                $scope.media.submit.loading.illustration = true;
                picture = $scope.media.form.illustration;
            } else if(type === 'exerciseImageToTranscribe') {
                $scope.media.submit.loading.exerciseImageToTranscribe = true;
                picture = $scope.media.form.exerciseImageToTranscribe;
            }

            upload(type, picture);
        };

        function upload(type, picture) {
            Upload.upload = Upload.upload({
                url: $rootScope.api+"/media-contents?type=TrainingContent&field="+type+"&id="+$scope.trainingContent.id,
                data: {media: picture}
            }).then(function (response) {
                console.log(response);
                if(type === 'illustration') {
                    $scope.media.submit.loading.illustration = false;
                    $scope.trainingContent.illustration = response.data.illustration;
                } else if(type === 'exerciseImageToTranscribe') {
                    $scope.media.submit.loading.exerciseImageToTranscribe = false;
                    $scope.trainingContent.exerciseImageToTranscribe = response.data.exerciseImageToTranscribe;
                }
            }, function errorCallback(error) {
                console.log(error);
                if(type === 'illustration') { $scope.media.submit.loading.illustration = false;}
                else if(type === 'exerciseImageToTranscribe') { $scope.media.submit.loading.exerciseImageToTranscribe = false;}
            });
        }
        /* New: Upload new media ------------------------------------------------------------------------------------ */
    }])
;