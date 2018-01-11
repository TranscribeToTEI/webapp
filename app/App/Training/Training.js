'use strict';

angular.module('transcript.app.training', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training', {
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppTrainingCtrl'
                }
            },
            url: '/training',
            resolve: {
                trainingContents: function(TrainingContentService) {
                    return TrainingContentService.getTrainingContents(null, null);
                }
            }
        })
    }])

    .controller('AppTrainingCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$transition$', 'tfMetaTags', function($log, $rootScope, $scope, $http, $sce, $state, $filter, $transition$, tfMetaTags) {
        tfMetaTags.setTitleSuffix(tfMetaTags.getTitleSuffix());

        /* End Training action -------------------------------------------------------------------------------------- */
        $scope.endTraining = function() {
            UserPreferenceService.patchPreferences({'tutorialStatus': 'done', 'tutorialProgress': null}, $rootScope.user.id).then(function() {
                $rootScope.user._embedded.preferences.tutorialStatus = 'done';
                $rootScope.user._embedded.preferences.tutorialProgress = null;
            });
            $state.go('transcript.app.search');
        };
        /* End: End Training action --------------------------------------------------------------------------------- */
    }])
;