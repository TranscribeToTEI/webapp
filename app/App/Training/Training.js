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
            url: '/training/:order',
            resolve: {
                trainingContent: function(TrainingContentService, $transition$) {
                    return TrainingContentService.getTrainingContentByOrder($transition$.params().order, true);
                }
            }
        })
    }])

    .controller('AppTrainingCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', 'trainingContent', function($log, $rootScope, $scope, $http, $sce, $state, tfMetaTags, trainingContent) {
        tfMetaTags.setTitleSuffix(tfMetaTags.getTitleSuffix());

        if(trainingContent.pageType === 'exercise') {
            $state.go('transcript.app.training.exercise.presentation', {order: trainingContent.orderInTraining});
        } else {
            $state.go('transcript.app.training.presentation', {order: trainingContent.orderInTraining});
        }
    }])
;