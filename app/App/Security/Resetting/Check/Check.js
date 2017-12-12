'use strict';

angular.module('transcript.app.security.resetting.check', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.resetting.check', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Resetting/Check/Check.html',
                        controller: 'AppSecurityResettingCheckCtrl'
                }
            },
            url: '/check',
            tfMetaTags: {
                title: 'Vérification | Réinitialisation du mot de passe',
            }
        })
    }])

    .controller('AppSecurityResettingCheckCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', function($log, $rootScope, $scope, $http, $sce, $state) {}])
;