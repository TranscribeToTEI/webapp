'use strict';

angular.module('transcript.app.user.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.edit', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/User/Edit/Edit.html',
                    controller: 'AppUserEditCtrl'
                }
            },
            url: '/edit/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: iUser.id})',
                label: 'Modification du profil'
            },
            tfMetaTags: {
                title: function(userEdit) {
                    return 'Modification | '+ userEdit.name +' | Profil utilisateur';
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

    .controller('AppUserEditCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'userEdit', 'flash', function($log, $rootScope, $scope, $http, $sce, $state, userEdit, flash) {
        if($rootScope.user === undefined && $rootScope.user !== userEdit) {$state.go('transcript.app.security.login');}

        /* -- Breadcrumb management -------------------------------------------------------- */
        $scope.iUser = userEdit;
        /* -- End : breadcrumb management -------------------------------------------------- */

        $scope.form = {
            name: $scope.iUser.name,
            biography: $scope.iUser.biography
        };
        $scope.submit = {
            loading: false,
            success: false
        };

        /* Submit data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;
            $http.patch($rootScope.api+"/users/"+$scope.iUser.id, $scope.form)
            .then(function (response) {
                $scope.submit.loading = false;
                if(response.status === 200) {
                    $scope.submit.success = true;
                    $scope.iUser = response.data;
                    if($rootScope.user.id === $scope.iUser.id) {
                        $rootScope.user = response.data;
                    }
                    flash.success = "Votre profil a bien été modifié. Vous allez être redirigé dans quelques instants ...";
                    $state.go('transcript.app.user.profile', {id: userEdit.id});
                } else if(response.data.code === 400) {
                    flash.error = "<ul>";
                    for(let field in response.data.errors.children) {
                        for(let error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li>"+field+" : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                }
            }, function errorCallback(response) {
                $log.debug(response);
                $scope.submit.loading = false;
            });
        };
    }])
;