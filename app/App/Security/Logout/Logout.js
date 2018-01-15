'use strict';

angular.module('transcript.app.security.logout', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.logout', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Security/Logout/Logout.html',
                        controller: 'AppSecurityLogoutCtrl'
                }
            },
            url: '/logout',
            tfMetaTags: {
                title: 'Déconnexion',
            },
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Déconnexion'
            }
        })
    }])

    .controller('AppSecurityLogoutCtrl', ['$log', '$rootScope', '$scope', '$http', '$sce', '$state', '$cookies', function($log, $rootScope, $scope, $http, $sce, $state, $cookies) {
        if($rootScope.user !== undefined) {
            delete $rootScope.oauth;
            delete $rootScope.user;
            $cookies.remove('transcript_security_token_access');
        }
        $state.go('transcript.app.home');
    }])
;