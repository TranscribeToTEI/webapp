'use strict';

angular.module('transcript.app.training.exercise', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training.exercise', {
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppTrainingExerciseCtrl'
                }
            },
            url: '/exercise',
            resolve: {
                trainingContent: function(TrainingContentService, $transition$) {
                    return TrainingContentService.getTrainingContentByOrder($transition$.params().order, true);
                }
            }
        })
    }])

    .controller('AppTrainingExerciseCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', 'trainingContent', function($log, $rootScope, $scope, $http, $sce, $state, tfMetaTags, trainingContent) {
        tfMetaTags.setTitleSuffix(tfMetaTags.getTitleSuffix());
    }])
;