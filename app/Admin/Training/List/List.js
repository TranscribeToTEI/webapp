'use strict';

angular.module('transcript.admin.training.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.training.list', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Training/List/List.html',
                    controller: 'AdminTrainingListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'transcript.admin.training.home',
                label: 'Liste des contenus'
            },
            tfMetaTags: {
                title: 'Liste | Entrainement | Administration ',
            },
            resolve: {
                trainingContents: function(TrainingContentService) {
                    return TrainingContentService.getTrainingContents(null, null);
                }
            }
        })
    }])

    .controller('AdminTrainingListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'trainingContents', function($log, $rootScope, $scope, $http, $sce, $state, trainingContents) {
        $scope.trainingContents = trainingContents;
    }])
;