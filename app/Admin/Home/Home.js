'use strict';

angular.module('transcript.admin.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.home', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Home/Home.html',
                    controller: 'AdminHomeCtrl'
                }
            },
            url: '/',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Admin'
            },
            tfMetaTags: {
                title: 'Accueil | Administration',
            },
            resolve: {
                accesses: function(AccessService) {
                    return AccessService.getAccesses().then(function(data){
                        return data;
                    });
                },
                transcriptsToValidate: function(TranscriptService) {
                    return TranscriptService.getTranscriptsByStatus('validation').then(function(data){
                        return data;
                    });
                }
            }
        })
    }])

    .controller('AdminHomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'accesses', 'transcriptsToValidate', function($rootScope, $scope, $http, $sce, $state, accesses, transcriptsToValidate) {
        $scope.accesses = accesses;
        $scope.transcriptsToValidate = transcriptsToValidate;
    }])
;