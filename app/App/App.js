'use strict';

angular.module('transcript.app', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('app', {
            abstract: true,
            views: {
                "navbar" : {
                    templateUrl: 'System/Navbar/Navbar.html',
                    controller: 'SystemNavbarCtrl'
                },
                "page" : {
                    template: '<div ui-view="page"></div>'
                }
            },
            url: '',
            resolve: {
                user: function(UserService) {
                    return UserService.getCurrent();
                }
            }
        })
    }])
;