'use strict';

angular.module('transcript.app.training.content', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training.content', {
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppTrainingContentCtrl'
                }
            },
            url: '/:order',
            resolve: {
                trainingContent: function(TrainingContentService, $transition$) {
                    if($transition$.params().order !== "0") {
                        return TrainingContentService.getTrainingContentByOrder($transition$.params().order, true);
                    } else {
                        return null;
                    }
                },
                thread: function(TrainingContentService, CommentService, $transition$) {
                    if($transition$.params().order !== "0") {
                        console.log($transition$.params().order);
                        return TrainingContentService.getTrainingContentByOrder($transition$.params().order, true).then(function (trainingContent) {
                            return CommentService.getThread('trainingContent-' + trainingContent.id);
                        });
                    } else {
                        return null;
                    }
                }
            }
        })
    }])

    .controller('AppTrainingContentCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$transition$', 'tfMetaTags', 'trainingContent', 'trainingContents', function($log, $rootScope, $scope, $http, $sce, $state, $filter, $transition$, tfMetaTags, trainingContent, trainingContents) {
        $scope.trainingContent = trainingContent;
        $scope.trainingContents = trainingContents;

        /* Redirection to correct route ----------------------------------------------------------------------------- */
        if($transition$._targetState._definition.name === "transcript.app.training.content") {
            if($transition$.params().order === "0") {
                $state.go('transcript.app.training.home');
            } else if(trainingContent.pageType === 'exercise') {
                $state.go('transcript.app.training.content.exercise.presentation', {order: $scope.trainingContent.orderInTraining});
            } else {
                $state.go('transcript.app.training.content.presentation', {order: $scope.trainingContent.orderInTraining});
            }
        }
        /* End: Redirection to correct route ------------------------------------------------------------------------ */

        /* Compute next content & training end ---------------------------------------------------------------------- */
        $scope.nextContent = $filter('filter')($scope.trainingContents, {orderInTraining: parseInt($transition$.params().order)+1});
        if($scope.nextContent.length === 0) {
            $scope.nextContent = null;
        } else {
            $scope.nextContent = $scope.nextContent[0];
        }
        /* End: Compute next content & training end ----------------------------------------------------------------- */
    }])
;