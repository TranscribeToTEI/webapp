'use strict';

angular.module('transcript.admin.transcript.validation', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.transcript.validation', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/Admin/Transcript/Validation/Validation.html',
                    controller: 'AdminTranscriptValidationCtrl'
                }
            },
            url: '/validation',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Testaments à valider'
            },
            tfMetaTags: {
                title: 'Testaments à valider | Transcription | Administration',
            },
            resolve: {
                transcripts: function(TranscriptService) {
                    return TranscriptService.getTranscriptsByStatus("validation", "id,adminValidation");
                }
            }
        })
    }])

    .controller('AdminTranscriptValidationCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'transcripts', function($log, $rootScope, $scope, $http, $sce, $state, transcripts) {
        $scope.transcripts = transcripts;
        $log.debug($scope.transcripts);
    }])
;