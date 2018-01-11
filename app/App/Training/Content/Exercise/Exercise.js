'use strict';

angular.module('transcript.app.training.content.exercise', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.training.content.exercise', {
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppTrainingContentExerciseCtrl'
                }
            },
            url: '/exercise'
        })
    }])

    .controller('AppTrainingContentExerciseCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', 'trainingContent', function($log, $rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(tfMetaTags.getTitleSuffix());
    }])
;