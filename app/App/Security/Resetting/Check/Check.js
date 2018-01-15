'use strict';

angular.module('transcript.app.security.resetting.check', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.resetting.check', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Security/Resetting/Check/Check.html',
                        controller: 'AppSecurityResettingCheckCtrl'
                }
            },
            url: '/check',
            ncyBreadcrumb: {
                parent: 'transcript.app.security.resetting.request',
                label: 'Vérification'
            },
            tfMetaTags: {
                title: 'Vérification | Réinitialisation du mot de passe',
            }
        })
    }])

    .controller('AppSecurityResettingCheckCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', function($log, $rootScope, $scope, $http, $sce, $state) {}])
;