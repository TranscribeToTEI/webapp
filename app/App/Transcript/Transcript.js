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
                parent: 'transcript.app.edition({idEntity: entity.id, idResource: resource.id})',
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
                resource: function(ResourceService, $transition$) {
                    return ResourceService.getResource($transition$.params().idResource);
                },
                entity: function(EntityService, $transition$) {
                    return EntityService.getEntity($transition$.params().idEntity);
                },
                thread: function(CommentService, $transition$) {
                    return CommentService.getThread('transcript-'+$transition$.params().idTranscript);
                },
                teiInfo: function(TranscriptService) {
                    return TranscriptService.getTeiInfo();
                },
                config: function() {
                    return YAML.load('System/Transcript/toolbar.yml');
                }
            }
        })
    }])

    .controller('AppTranscriptCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$timeout', '$filter', '$transitions', '$window', function($log, $rootScope, $scope, $http, $sce, $state, $timeout, $filter, $transitions, $window) {

    }])
;