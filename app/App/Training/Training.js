'use strict';

angular.module('transcript.app.training', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app.training', {
            views: {
                "page" : {
                    templateUrl: 'App/Training/Training.html',
                    controller: 'AppTrainingCtrl'
                }
            },
            url: '/training',
            ncyBreadcrumb: {
                parent: 'app.home',
                label: 'Découvrir'
            }
        })
    }])

    .controller('AppTrainingCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {

    }])
;