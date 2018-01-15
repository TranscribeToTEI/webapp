'use strict';

angular.module('transcript.admin.training.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.training.home', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/Training/Home/Home.html',
                        controller: 'AdminTrainingHomeCtrl'
                    }
                },
                url: '/',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.home',
                    label: 'Entrainement'
                },
                tfMetaTags: {
                    title: 'Accueil | Entrainement | Administration ',
                },
                resolve: {
                    trainingContents: function(TrainingContentService) {
                        return TrainingContentService.getTrainingContents(null, null, "ASC");
                    }
                }
            })
    }])

    .controller('AdminTrainingHomeCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'trainingContents', function($log, $rootScope, $scope, $http, $sce, $state, trainingContents) {
        $scope.trainingContents = trainingContents;
    }])
;