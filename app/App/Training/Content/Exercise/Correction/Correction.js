'use strict';

angular.module('transcript.app.training.content.exercise.correction', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training.content.exercise.correction', {
            views: {
                "page" : {
                    templateUrl: 'App/Training/Content/Exercise/Correction/Correction.html',
                    controller: 'AppTrainingContentExerciseCorrectionCtrl'
                },
                "comment@transcript.app.training.content.exercise.correction" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            url: '/correction',
            ncyBreadcrumb: {
                parent: 'transcript.app.training.content.exercise.exercise',
                label: 'Correction'
            },
            tfMetaTags: {
                title: '{{ trainingContent.title }}',
            },
            resolve: {
                exerciseResult: function($http, $rootScope, TrainingContentService, $transition$) {
                    return TrainingContentService.getTrainingContentByOrder($transition$.params().order, true).then(function(data) {
                        return $http.get($rootScope.api + "/training-results?user="+$rootScope.user.id+"&trainingContent="+data.id);
                    });
                }
            }
        })
    }])

    .controller('AppTrainingContentExerciseCorrectionCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'UserPreferenceService', 'trainingContent', 'trainingContents', 'exerciseResult', function($log, $rootScope, $scope, $http, $sce, $state, $filter, UserPreferenceService, trainingContent, trainingContents, exerciseResult) {
        $scope.trainingContent = trainingContent;
        $scope.trainingContents = trainingContents;

        $scope.exerciseResults = exerciseResult.data; console.log($scope.exerciseResults);
        if($scope.exerciseResults.length > 0) {
            $scope.exerciceResult = $scope.exerciseResults[0];
        } else {
            $scope.exerciceResult = null;
        }

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

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Viewer Management */
        /* ---------------------------------------------------------------------------------------------------------- */
        let imageSource = [];
        imageSource.push($rootScope.iiif.server + "/exercise" + $rootScope.iiif.separator + $scope.trainingContent.exerciseImageToTranscribe);

        console.log(imageSource);
        $scope.openseadragon = {
            prefixUrl: "/webapp/app/web/libraries/js/openseadragon/images/",
            tileSources: imageSource
        };
        /* Viewer Management ---------------------------------------------------------------------------------------- */

    }])
;