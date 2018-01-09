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
                },
                "transcript@transcript.app.training.exercise" : {
                    templateUrl: 'System/Transcript/Transcript.html',
                    controller: 'SystemTranscriptCtrl'
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
                },
                transcript: function() {
                    return {
                        "content": null,
                        "status": "todo",
                        "continueBefore": false,
                        "continueAfter": false,
                        "createUser": null,
                        "createDate": null,
                        "updateUser": null,
                        "updateDate": null,
                        "updateComment": "Creation of the transcript",
                        "_embedded": {
                            "version": [],
                            "resource": {
                                "entity": {
                                    "willNumber": null,
                                    "will": null,
                                    "resources": [],
                                    "isShown": true,
                                    "createUser": null,
                                    "createDate": null,
                                    "updateUser": null,
                                    "updateDate": null,
                                    "_embedded": {
                                        "status": "todo"
                                    }
                                },
                                "type": "page",
                                "orderInWill": 1,
                                "images": [
                                    "FRAN_Poilus_t-0001_01"
                                ],
                                "notes": null,
                                "transcript": null,
                                "createUser": null,
                                "createDate": null,
                                "updateUser": null,
                                "updateDate": null,
                            },
                            "isCurrentlyEdited": false,
                            "logs": []
                        }
                    };
                },
                teiInfo: function(TranscriptService) {
                    return TranscriptService.getTeiInfo();
                },
                config: function() {
                    return YAML.load('System/Transcript/toolbar.yml');
                },
                transcriptConfig: function(TrainingContentService, $transition$) {
                    return TrainingContentService.getTrainingContentByOrder($transition$.params().order, true).then(function(response) {
                        return {
                            isHeader: false,
                            isComments: false,
                            isValidation: false,
                            isExercise: true,
                            isSmartTEI: response.exerciseIsSmartTEI,
                            isAttributesManagement: response.exerciseIsAttributesManagement,
                            isLiveRender: response.exerciseIsLiveRender,
                            isHelp: response.exerciseIsHelp,
                            isDocumentation: response.exerciseIsDocumentation,
                            isTaxonomy: response.exerciseIsTaxonomy,
                            isNotes: response.exerciseIsNotes,
                            isVersioning: response.exerciseIsVersioning,
                            isComplexFields: response.exerciseIsComplexFields,
                            correctionTranscript: response.exerciseCorrectionTranscript,
                            correctionErrorsToAvoid: response.exerciseCorrectionErrorsToAvoid,
                            tagsList: response.exerciseTagsList,
                            exerciseImageToTranscribe: response.exerciseImageToTranscribe
                        }
                    });
                }
            }
        })
    }])

    .controller('AppTrainingExerciseCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'trainingContent', 'trainingContents', 'UserPreferenceService', 'transcriptConfig', function($log, $rootScope, $scope, $http, $sce, $state, $filter, trainingContent, trainingContents, UserPreferenceService, transcriptConfig) {
        $scope.trainingContent = trainingContent;
        $scope.trainingContents = trainingContents;
        $scope.transcriptConfig = transcriptConfig;

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