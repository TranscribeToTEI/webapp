'use strict';

angular.module('transcript.app.user.avatar', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.avatar', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/User/Avatar/Avatar.html',
                    controller: 'AppUserAvatarCtrl'
                }
            },
            url: '/avatar/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: user.id})',
                label: 'Modification de l\'avatar'
            },
            tfMetaTags: {
                title: function(userEdit) {
                    return 'Avatar | '+ userEdit.name +' | Profil utilisateur';
                },
            },
            resolve: {
                userEdit: function(UserService, $transition$, $rootScope) {
                    if($rootScope.user.id !== $transition$.params().id) {
                        return UserService.getUser($transition$.params().id, 'id,userProfile,userEmail');
                    } else {
                        return $rootScope.user;
                    }
                }
            }
        })
    }])

    .controller('AppUserAvatarCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'userEdit', 'flash', 'Upload', function($log, $rootScope, $scope, $http, $sce, $state, userEdit, flash, Upload) {
        if($rootScope.user === undefined && $rootScope.user !== userEdit) {$state.go('transcript.app.security.login');}

        /* -- Breadcrumb management -------------------------------------------------------- */
        $scope.iUser = $rootScope.user;
        /* -- End : breadcrumb management -------------------------------------------------- */

        $scope.form = {
            picture: null
        };
        $scope.submit = {
            loading: false,
            success: false
        };

        /* Submit data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;

            Upload.upload = Upload.upload({
                url: $rootScope.api+"/users-avatar?id="+$rootScope.user.id,
                data: {picture: $scope.form.picture}
            }).then(function (response) {
                $log.debug(response);
                $scope.submit.loading = false;
                $scope.submit.success = true;
                flash.success = "Vous allez être redirigé dans quelques instants ...";
                $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
            });
        };
    }])
;