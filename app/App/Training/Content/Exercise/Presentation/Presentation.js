'use strict';

angular.module('transcript.app.training.content.exercise.presentation', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training.content.exercise.presentation', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Training/Content/Exercise/Presentation/Presentation.html',
                    controller: 'AppTrainingContentExercisePresentationCtrl'
                },
                "comment@transcript.app.training.content.exercise.presentation" : {
                    templateUrl: '/webapp/app/System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            url: '/presentation',
            ncyBreadcrumb: {
                parent: 'transcript.app.training.home',
                label: '{{ trainingContent.title }}'
            },
            tfMetaTags: {
                title: '{{ trainingContent.title }}',
            }
        })
    }])

    .controller('AppTrainingContentExercisePresentationCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$transition$', 'trainingContent', 'trainingContents', 'UserPreferenceService', function($log, $rootScope, $scope, $http, $sce, $state, $filter, $transition$, trainingContent, trainingContents, UserPreferenceService) {
        $scope.trainingContent = trainingContent;
        $scope.trainingContents = trainingContents;
        $scope.$transition$ = $transition$;

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
    }])
;