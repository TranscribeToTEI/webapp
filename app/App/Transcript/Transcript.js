'use strict';

angular.module('transcript.app.transcript', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.transcript', {
            views: {
                "page" : {
                    templateUrl: 'App/Transcript/Transcript.html',
                    controller: 'AppTranscriptCtrl'
                },
                "comment@transcript.app.transcript" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                },
                "transcript@transcript.app.transcript" : {
                    templateUrl: 'System/Transcript/Transcript.html',
                    controller: 'SystemTranscriptCtrl'
                }
            },
            ncyBreadcrumb: {
                parent: 'transcript.app.edition({idEntity: idEntity, idResource: idResource})',
                label: 'Transcription'
            },
            tfMetaTags: {
                title: 'Transcription',
            },
            url: '/transcript/:idEntity/:idResource/:idTranscript',
            data: {
                permissions: {
                    only: 'ROLE_USER',
                    redirectTo: 'transcript.app.security.login'
                }
            },
            resolve: {
                transcript: function(TranscriptService, $transition$) {
                    return TranscriptService.getTranscript($transition$.params().idTranscript);
                },
                idResource: function(ResourceService, $transition$) {
                    return $transition$.params().idResource;
                },
                idEntity: function(EntityService, $transition$) {
                    return $transition$.params().idEntity;
                },
                thread: function(CommentService, $transition$) {
                    return CommentService.getThread('transcript-'+$transition$.params().idTranscript);
                },
                teiInfo: function(TranscriptService) {
                    return TranscriptService.getTeiInfo();
                },
                config: function() {
                    return YAML.load('System/Transcript/toolbar.yml');
                },
                transcriptConfig: function() {
                    return {
                        isHeader: true,
                        isVersioning: true,
                        isComments: true,
                        isValidation: true,
                        isExercise: false,
                        isSmartTEI: null,
                        isAttributesManagement: null,
                        isLiveRender: null,
                        isHelp: null,
                        isDocumentation: null,
                        isTaxonomy: null,
                        isNotes: null,
                        isComplexFields: null,
                        correctionTranscript: null,
                        correctionErrorsToAvoid: null,
                        tagsList: null,
                        exerciseImageToTranscribe: null,
                        exerciseId: null,
                    }
                }
            }
        })
    }])

    .controller('AppTranscriptCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$timeout', '$filter', '$transitions', '$window', function($log, $rootScope, $scope, $http, $sce, $state, $timeout, $filter, $transitions, $window) {

    }])
;