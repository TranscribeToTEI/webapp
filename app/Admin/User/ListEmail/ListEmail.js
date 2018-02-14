'use strict';

angular.module('transcript.admin.user.listEmail', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.user.listEmail', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/Admin/User/ListEmail/ListEmail.html',
                    controller: 'AdminUserListCtrl'
                }
            },
            url: '/ListEmail',
            ncyBreadcrumb: {
                parent: 'transcript.admin.user.list',
                label: 'Liste des emails'
            },
            tfMetaTags: {
                title: 'Emails | Liste | Utilisateurs | Administration',
            },
            resolve: {
                users: function(UserService) {
                    return UserService.getUsers('email');
                }
            }
        })
    }])

    .controller('AdminUserListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'users', function($log, $rootScope, $scope, $http, $sce, $state, users) {
        $scope.users = users;
        $scope.emails = "";

        for(let iUser in $scope.users) {
            if($scope.emails !== "") {$scope.emails += ",\n";}
            $scope.emails += $scope.users[iUser].email;
        }
    }])
;