'use strict';

angular.module('transcript.admin.preference', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.preference', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/AppPreference/AppPreference.html',
                        controller: 'AdminAppPreferenceCtrl'
                    }
                },
                url: '/preferences',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.home',
                    label: 'Préférences système'
                },
                tfMetaTags: {
                    title: 'Préférence système | Administration',
                }
            })
    }])

    .controller('AdminAppPreferenceCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'AppService', function($log, $rootScope, $scope, $http, $sce, $state, flash, AppService) {
        $scope.submit = {
            loading: false,
            success: false
        };
        $scope.options = {
            language: 'fr',
            allowedContent: true,
            entities: false,
            toolbar: [
                ['Source','NewPage','Print','Templates','-','Find','Replace','Scayt','RemoveFormat','-','Undo','Redo','-','Maximize','ShowBlocks'],
                ['Bold','Italic','Underline','StrikeThrough','Strike','Subscript','Superscript','-','NumberedList','BulletedList','Outdent','Indent','Blockquote','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','Link','Unlink','Anchor'],
                ['Image','Table','HorizontalRule','Smiley','SpecialChar','PageBreak','InsertPre'],
                ['Styles','Format','Font','FontSize','-','TextColor','BGColor']
            ]
        };

        let id = $rootScope.preferences.id;
        $scope.preferences = $rootScope.preferences;
        delete $scope.preferences.id;
        delete $scope.preferences._links;
        delete $scope.preferences.updateDate;
        delete $scope.preferences.updateUser;

        $scope.submit.action = function() {
            $scope.submit.loading = true;
            patchPreference();

            function patchPreference() {
                if($scope.preferences.enableContact === null) {$scope.preferences.enableContact = false;}

                return AppService.patchPreference(id, $scope.preferences).
                then(function(response) {
                    if(response.status === 200) {
                        $rootScope.preferences = response.data;
                        $scope.submit.loading = false;
                        $scope.submit.success = true;
                        flash.success = "Vous allez être redirigé dans quelques instants ...";
                        $state.go('transcript.admin.home');
                    } else if(response.status === 400) {
                        flash.error = "<ul>";
                        for(let field of response.data.errors.children) {
                            for(let error of field) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+error+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                    }
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    $log.debug(response);
                });
            }
        };

    }])
;