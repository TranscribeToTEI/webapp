'use strict';

angular.module('transcript.admin.hosting-organization.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.hosting-organization.new', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/HostingOrganization/Edit/Edit.html',
                        controller: 'AdminHostingOrganizationEditCtrl'
                    }
                },
                url: '/new',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.hosting-organization.list',
                    label: 'Nouvelle institution de conservation'
                },
                tfMetaTags: {
                    title: 'Nouvelle | Institution de conservation | Administration',
                },
                resolve: {
                    organization: function() {
                        return null;
                    }
                }
            })
            .state('transcript.admin.hosting-organization.edit', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/HostingOrganization/Edit/Edit.html',
                        controller: 'AdminHostingOrganizationEditCtrl'
                    }
                },
                url: '/edit/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.hosting-organization.list',
                    label: 'Modification de {{ organization.name }}'
                },
                tfMetaTags: {
                    title: '{{ organization.name }} | Modification | Institution de conservation | Administration',
                },
                resolve: {
                    organization: function(HostingOrganizationService, $transition$) {
                        return HostingOrganizationService.getOrganization($transition$.params().id);
                    }
                }
            })
    }])

    .controller('AdminHostingOrganizationEditCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$timeout', 'flash', 'Upload', 'organization', function($log, $rootScope, $scope, $http, $sce, $state, $timeout, flash, Upload, organization) {
        /* Scope management ----------------------------------------------------------------------------------------- */
        if(organization !== null) {
            $log.log(organization);
            $scope.organization = organization;
            $scope.organization.updateComment = null;
        } else {
            $scope.organization = {
                id: null,
                name: null,
                code: null,
                updateComment: "Creation of the organization",
            };
        }

        $scope.submit = {
            loading: false,
            success: false
        };
        $scope.remove = {
            loading: false
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
        /* End: Scope management ------------------------------------------------------------------------------------ */

        /* Upload new media ----------------------------------------------------------------------------------------- */
        $scope.media = {
            form: {
                image: null
            },
            submit: {
                loading: false,
                success: false
            }
        };

        /* Submit data */
        $scope.media.submit.action = function() {
            $scope.media.submit.loading = true;
            upload();
        };

        function upload() {
            let url = "/media-contents?type=HostingOrganization&field=logo";
            if($scope.organization.id !== undefined && $scope.organization.id !== null) {
                url = "/media-contents?type=HostingOrganization&field=logo&id="+$scope.organization.id;
            }
            Upload.upload = Upload.upload({
                url: $rootScope.api+url,
                data: {media: $scope.media.form.illustration}
            }).then(function (response) {
                $log.log(response);
                $scope.media.submit.loading = false;
                $scope.media.submit.success = true;
                $timeout(function() {
                    $scope.media.submit.success = false;
                }, 5000);

                if($scope.content.id !== undefined && $scope.content.id !== null) {
                    $scope.organization.logo = response.data.illustration;
                } else {
                    $scope.organization.logo = response.data;
                }
            }, function errorCallback(error) {
                $log.log(error);
                $scope.media.submit.loading = false;
            });
        }
        /* End: Upload new media ------------------------------------------------------------------------------------ */

        /* Submit Management ---------------------------------------------------------------------------------------- */
        $scope.submit.action = function() {
            $scope.submit.success = false;
            $scope.submit.loading = true;

            let form = {
                name: $scope.organization.name,
                code: $scope.organization.code,
                website: $scope.organization.website,
                description: $scope.organization.description,
                logo: $scope.organization.logo,
                updateComment: $scope.organization.updateComment,
            };
            if($scope.organization.id === null) {
                /* If content.id == null > The content doesn't exist, we post it */
                $http.post($rootScope.api+'/hosting-organizations', form).
                then(function (response) {
                    $log.log(response.data);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    flash.success = "Vous allez être redirigé dans quelques instants...";
                    $state.go('transcript.admin.hosting-organization.list');
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    flash.error = "<ul>";
                    for(let field in response.data.errors.children) {
                        for(let error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                    $log.log(response);
                });
            } else if($scope.organization.id !== null) {
                /* If content.id != null > The content already exists, we just patch it */
                $http.patch($rootScope.api+'/hosting-organizations/'+$scope.organization.id, form).
                then(function (response) {
                    $log.log(response.data);
                    flash.success = "Le contenu a bien été mis à jour. Vous allez être redirigé dans quelques instants ...";
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    $state.go('transcript.admin.hosting-organization.list');
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    flash.error = "<ul>";
                    for(let field in response.data.errors.children) {
                        for(let error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                    $log.log(response);
                });
            }
        };
        /* End: Submit Management ----------------------------------------------------------------------------------- */

        /* Submit Management ---------------------------------------------------------------------------------------- */
        $scope.remove.action = function() {
            $scope.remove.loading = true;
            $http.delete($rootScope.api+'/hosting-organizations/'+$scope.organization.id).
            then(function (response) {
                flash.success = "Votre contenu a bien été supprimé. Vous allez être redirigé dans quelques instants ...";
                $scope.submit.loading = false;
                $state.go('transcript.admin.hosting-organization.list');
            }, function errorCallback(response) {
                $scope.validation.loading = false;
                $log.log(response);
            });
        };
        /* End: Remove Management ----------------------------------------------------------------------------------- */
    }])
;