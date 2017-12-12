'use strict';

angular.module('transcript.app.user.profile', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.app.user.profile', {
                views: {
                    "page" : {
                        templateUrl: 'App/User/Profile/Profile.html',
                        controller: 'AppUserProfileCtrl'
                    }
                },
                url: '/profile/{id}',
                ncyBreadcrumb: {
                    parent: 'transcript.app.home',
                    label: '{{ iUser.name }}'
                },
                tfMetaTags: {
                    title: function(userEdit) {
                        return userEdit.name+' | Profil utilisateur';
                    }
                },
                resolve: {
                    userEdit: function(UserService, $transition$) {
                        return UserService.getUser($transition$.params().id, "full");
                    }
                }
            })
    }])

    .controller('AppUserProfileCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'userEdit', 'EntityService', 'ImageService', function($log, $rootScope, $scope, $http, $sce, $state, $filter, userEdit, EntityService, ImageService) {
        $log.log($rootScope.user);
        $log.log(userEdit);

        $scope.context = "view";
        $scope.iUser = userEdit;
        if($rootScope.user === undefined) {
            $scope.context = "view";
        } else if($rootScope.user.id === $scope.iUser.id) {
            $scope.context = "self";
        } else if($rootScope.user.id !== $scope.iUser.id && ($filter('contains')($rootScope.user.roles, "ROLE_ADMIN") || $filter('contains')($rootScope.user.roles, "ROLE_MODO"))) {
            $scope.context = "admin";
        }

        $scope.imageService = ImageService;
    }])
;