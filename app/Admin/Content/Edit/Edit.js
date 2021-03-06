'use strict';

angular.module('transcript.admin.content.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.content.new', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/Content/Edit/Edit.html',
                        controller: 'AdminContentEditCtrl'
                    }
                },
                url: '/new',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.content.list',
                    label: 'Nouveau contenu'
                },
                tfMetaTags: {
                    title: 'Nouveau | Contenus  | Administration',
                },
                resolve: {
                    content: function() {
                        return null;
                    },
                    users: function(UserService) {
                        return UserService.getUsers('short');
                    }
                }
            })
            .state('transcript.admin.content.edit', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/Content/Edit/Edit.html',
                        controller: 'AdminContentEditCtrl'
                    }
                },
                url: '/edit/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.app.content({id: content.id})',
                    label: 'Modification'
                },
                tfMetaTags: {
                    title: '{{ content.title }} | Modification | Contenus  | Administration',
                },
                resolve: {
                    content: function(ContentService, $transition$) {
                        return ContentService.getContent($transition$.params().id);
                    },
                    users: function(UserService) {
                        return UserService.getUsers('short');
                    }
                }
            })
    }])

    .controller('AdminContentEditCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$timeout', 'CommentService', 'flash', 'Upload', 'content', 'users', function($log, $rootScope, $scope, $http, $sce, $state, $timeout, CommentService, flash, Upload, content, users) {
        $scope.users = users;

        /* Scope management ----------------------------------------------------------------------------------------- */
        if(content !== null) {
            $log.debug(content);
            $scope.content = content;
            $scope.content.updateComment = "";

            for(let iER in $scope.content.editorialResponsibility) {
                $scope.content.editorialResponsibility[iER] = $scope.content.editorialResponsibility[iER].id;
            }
        } else {
            $scope.content = {
                id: null,
                title: null,
                abstract: null,
                content: null,
                status: null,
                type: null,
                staticCategory: null,
                staticOrder: null,
                enableComments: true,
                updateComment: "Création du contenu",
                illustration: null,
                editorialResponsibility: []
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
            let url = "/media-contents?type=Content&field=illustration";
            if($scope.content.id !== undefined && $scope.content.id !== null) {
                url = "/media-contents?type=Content&field=illustration&id="+$scope.content.id;
            }
            Upload.upload = Upload.upload({
                url: $rootScope.api+url,
                data: {media: $scope.media.form.illustration}
            }).then(function (response) {
                $log.debug(response);
                $scope.media.submit.loading = false;
                $scope.media.submit.success = true;
                $timeout(function() {
                    $scope.media.submit.success = false;
                }, 5000);

                if($scope.content.id !== undefined && $scope.content.id !== null) {
                    $scope.content.illustration = response.data.illustration;
                } else {
                    $scope.content.illustration = response.data;
                }
            }, function errorCallback(error) {
                $log.debug(error);
                $scope.media.submit.loading = false;
            });
        }
        /* End: Upload new media ------------------------------------------------------------------------------------ */

        /* Submit Management ---------------------------------------------------------------------------------------- */
        $scope.submit.action = function() {
            $scope.submit.success = false;
            $scope.submit.loading = true;
            let form = {
                title: $scope.content.title,
                abstract: $scope.content.abstract,
                content: $scope.content.content,
                type: $scope.content.type,
                status: $scope.content.status,
                staticCategory: $scope.content.staticCategory,
                staticOrder: $scope.content.staticOrder,
                enableComments: $scope.content.enableComments,
                updateComment: $scope.content.updateComment,
                illustration: $scope.content.illustration,
                editorialResponsibility: $scope.content.editorialResponsibility
            };
            if($scope.content.id === null) {
                /* If content.id == null > The content doesn't exist, we post it */
                $http.post($rootScope.api+'/contents', form).
                then(function (response) {
                    $log.debug(response.data);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    flash.success = "Vous allez être redirigé dans quelques instants ...";
                    $state.go('transcript.app.content', {id: response.data.id});
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
                    $log.debug(response);
                });
            } else if($scope.content.id !== null) {
                /* If content.id != null > The content already exists, we just patch it */
                $http.patch($rootScope.api+'/contents/'+$scope.content.id, form).
                then(function (response) {
                    $log.debug(response.data);
                    flash.success = "Le contenu a bien été mis à jour";
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    $timeout(function() {
                        $scope.submit.success = false;
                    }, 5000);
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
                    $log.debug(response);
                });
            }
        };
        /* End: Submit Management ----------------------------------------------------------------------------------- */

        /* Submit Management ---------------------------------------------------------------------------------------- */
        $scope.remove.action = function() {
            $scope.remove.loading = true;
            $http.delete($rootScope.api+'/contents/'+$scope.content.id).
            then(function (response) {
                flash.success = "Votre contenu a bien été supprimé. Vous allez être redirigé dans quelques instants ...";
                $scope.submit.loading = false;
                $state.go('transcript.admin.content.list');
            }, function errorCallback(response) {
                $scope.validation.loading = false;
                $log.debug(response);
            });
        };
        /* End: Remove Management ----------------------------------------------------------------------------------- */
    }])
;