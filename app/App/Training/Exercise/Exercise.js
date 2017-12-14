'use strict';

angular.module('transcript.app.training.exercise', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training.exercise', {
            views: {
                "page" : {
                    templateUrl: 'App/Training/Exercise/Exercise.html',
                    controller: 'AppTrainingExerciseCtrl'
                },
                "comment@transcript.app.training.exercise" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            url: '/exercise',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: '{{ trainingContent.title }}'
            },
            tfMetaTags: {
                title: '{{ trainingContent.title }}',
            },
            resolve: {
                trainingContent: function(TrainingContentService, $transition$) {
                    return TrainingContentService.getTrainingContentByOrder($transition$.params().order, true);
                },
                trainingContents: function(TrainingContentService) {
                    return TrainingContentService.getTrainingContents(null, null);
                },
                thread: function(TrainingContentService, CommentService, $transition$) {
                    return TrainingContentService.getTrainingContentByOrder($transition$.params().order, true).then(function(trainingContent) {
                        return CommentService.getThread('trainingContent-'+trainingContent.id);
                    });
                }
            }
        })
    }])

    .controller('AppTrainingExerciseCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'trainingContent', 'trainingContents', 'UserPreferenceService', function($log, $rootScope, $scope, $http, $sce, $state, $filter, trainingContent, trainingContents, UserPreferenceService) {
        $scope.trainingContent = trainingContent;
        $scope.trainingContents = trainingContents;

        /* Updating user's preferences ------------------------------------------------------------------------------ */
        if($rootScope.user._embedded.preferences.tutorialStatus === 'todo' || $rootScope.user._embedded.preferences.tutorialStatus === 'inProgress') {
            UserPreferenceService.patchPreferences({
                'tutorialStatus': 'inProgress',
                'tutorialProgress': $scope.trainingContent.orderInTraining
            }, $rootScope.user.id).then(function () {
                $rootScope.user._embedded.preferences.tutorialStatus = 'inProgress';
                $rootScope.user._embedded.preferences.tutorialProgress = $scope.trainingContent.orderInTraining;
            });
        }
        /* End: Updating user's preferences ------------------------------------------------------------------------- */

        /* End Training action -------------------------------------------------------------------------------------- */
        $scope.endTraining = function() {
            UserPreferenceService.patchPreferences({'tutorialStatus': 'done', 'tutorialProgress': null}, $rootScope.user.id).then(function() {
                $rootScope.user._embedded.preferences.tutorialStatus = 'done';
                $rootScope.user._embedded.preferences.tutorialProgress = null;
            });
            $state.go('transcript.app.search');
        };
        /* End: End Training action --------------------------------------------------------------------------------- */

        /* Compute next content & training end ---------------------------------------------------------------------- */
        $scope.nextContent = $filter('filter')($scope.trainingContents, {orderInTraining: $scope.trainingContent.orderInTraining+1});
        if($scope.nextContent.length === 0) {
            $scope.nextContent = null;
        } else {
            $scope.nextContent = $scope.nextContent[0];
        }
        /* End: Compute next content & training end ----------------------------------------------------------------- */

        /* Exercise status management ------------------------------------------------------------------------------- */
        if($scope.trainingContent.pageType === 'exercise') {
            $scope.trainingContent.exerciseStatus = 'todo';
        }
        /* End: Exercise status management -------------------------------------------------------------------------- */
    }])
;