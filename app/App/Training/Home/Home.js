'use strict';

angular.module('transcript.app.training.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training.home', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Training/Home/Home.html',
                    controller: 'AppTrainingHomeCtrl'
                }
            },
            url: '/home',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Module d\'entrainement'
            },
            tfMetaTags: {
                title: 'Module d\'entrainement',
            }
        })
    }])

    .controller('AppTrainingHomeCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'trainingContents', 'UserPreferenceService', function($log, $rootScope, $scope, $http, $sce, $state, $filter, trainingContents, UserPreferenceService) {
        $scope.trainingContents = trainingContents;
        /* Updating user's preferences ------------------------------------------------------------------------------ */
        if($rootScope.user._embedded.preferences.tutorialStatus === 'todo' || $rootScope.user._embedded.preferences.tutorialStatus === 'inProgress') {
            UserPreferenceService.patchPreferences({
                'tutorialStatus': 'inProgress',
                'tutorialProgress': 0
            }, $rootScope.user.id).then(function () {
                $rootScope.user._embedded.preferences.tutorialStatus = 'inProgress';
                $rootScope.user._embedded.preferences.tutorialProgress = 0;
            });
        }
        /* End: Updating user's preferences ------------------------------------------------------------------------- */
    }])
;