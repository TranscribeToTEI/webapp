'use strict';

angular.module('transcript.app.training.content.presentation', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training.content.presentation', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Training/Content/Presentation/Presentation.html',
                    controller: 'AppTrainingContentPresentationCtrl'
                },
                "comment@transcript.app.training.content.presentation" : {
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

    .controller('AppTrainingContentPresentationCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'trainingContent', 'trainingContents', 'UserPreferenceService', function($log, $rootScope, $scope, $http, $sce, $state, $filter, trainingContent, trainingContents, UserPreferenceService) {
        $scope.trainingContent = trainingContent;

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
    }])
;