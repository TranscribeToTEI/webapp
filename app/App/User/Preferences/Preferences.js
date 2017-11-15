'use strict';

angular.module('transcript.app.user.preferences', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.preferences', {
            views: {
                "page" : {
                    templateUrl: 'App/User/Preferences/Preferences.html',
                    controller: 'AppUserPreferencesCtrl'
                }
            },
            url: '/preferences/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: user.id})',
                label: 'Modification des préférences'
            },
            tfMetaTags: {
                title: function(userEdit) {
                    return 'Préférences | '+ userEdit.name +' | Profil utilisateur';
                },
            },
            resolve: {
                userPreferences: function(UserPreferenceService, $transition$) {
                    return UserPreferenceService.getPreferences($transition$.params().id);
                }
            }
        })
    }])

    .controller('AppUserPreferencesCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$cookies', 'UserPreferenceService', 'userPreferences', 'flash', function($rootScope, $scope, $http, $sce, $state, $cookies, UserPreferenceService, userPreferences, flash) {
        if($rootScope.user === undefined) {$state.go('transcript.app.security.login');}
        /* -- Breadcrumb management -------------------------------------------------------- */
        $scope.iUser = $rootScope.user;
        /* -- End : breadcrumb management -------------------------------------------------- */

        console.log(userPreferences);
        $scope.userPreferences = userPreferences;
        $scope.form = {
            transcriptionDeskPosition: $scope.userPreferences.transcriptionDeskPosition,
            smartTEI: $scope.userPreferences.smartTEI,
            showComplexEntry: $scope.userPreferences.showComplexEntry,
            creditActions: $scope.userPreferences.creditActions
        };
        $scope.submit = {
            loading: false,
            success: false
        };

        /* Submit data ---------------------------------------------------------------------------------------------- */
        $scope.submit.action = function() {
            $scope.submit.loading = true;

            return UserPreferenceService.patchPreferences(
                $scope.form, $scope.iUser.id
            ).then(function (response) {
                console.log(response);
                $scope.submit.loading = false;
                if(response.status === 200) {
                    $rootScope.user._embedded.preferences = response.data;
                    $scope.submit.success = true;
                    flash.success = "Vous allez être redirigé dans quelques instants ...";
                    $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
                } else if(response.data.code === 400) {
                    flash.error = '<ul>';
                    for(let field in response.data.errors.children) {
                        for(let error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li>"+field+" : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += '</ul>';
                }
            }, function errorCallback(response) {
                console.log(response);
                $scope.submit.loading = false;
            });
        };
        /* End: Submit data ----------------------------------------------------------------------------------------- */

        /* Remove User ---------------------------------------------------------------------------------------------- */
        $scope.remove = {
            loading: false,
            success: false
        };
        $scope.remove.action = function() {
            $scope.remove.loading = true;

            $http.delete($rootScope.api+'/users/'+$scope.iUser.id).
            then(function (response) {
                console.log(response.data);
                flash.success = "Vous allez être redirigé dans quelques instants ...";
                $scope.remove.loading = false;
                $scope.remove.success = true;
                delete $rootScope.oauth;
                delete $rootScope.user;
                $cookies.remove('transcript_security_token_access');
                $state.go('transcript.app.home');
            }, function errorCallback(response) {
                $scope.remove.loading = false;
                if(response.data.code === 400) {
                    flash.error = "<ul>";
                    for(let field in response.data.errors.children) {
                        for(let error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";

                }
                console.log(response);
            });
        };
        /* End: Remove User ----------------------------------------------------------------------------------------- */
    }])
;