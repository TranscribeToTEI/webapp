'use strict';

angular.module('transcript.admin.user.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.user.list', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/Admin/User/List/List.html',
                    controller: 'AdminUserListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Liste des utilisateurs'
            },
            tfMetaTags: {
                title: 'Liste | Utilisateurs | Administration',
            },
            resolve: {
                users: function(UserService) {
                    return UserService.getUsers();
                }
            }
        })
    }])

    .controller('AdminUserListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'users', function($log, $rootScope, $scope, $http, $sce, $state, users) {
        $scope.users = users;
    }])
;