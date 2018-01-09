'use strict';

angular.module('transcript.admin.training.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.training.new', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Training/Edit/Edit.html',
                        controller: 'AdminTrainingEditCtrl'
                    }
                },
                url: '/new',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.training.list',
                    label: 'Nouvel élément d\'entrainement'
                },
                tfMetaTags: {
                    title: 'Nouveau | Entrainement | Administration ',
                },
                resolve: {
                    trainingContent: function() {
                        return null;
                    },
                    trainingContents: function(TrainingContentService) {
                        return TrainingContentService.getTrainingContents(null, null);
                    },
                    users: function(UserService) {
                        return UserService.getUsers('short');
                    },
                    config: function() {
                        return YAML.load('System/Transcript/toolbar.yml');
                    }
                }
            })
            .state('transcript.admin.training.edit', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Training/Edit/Edit.html',
                        controller: 'AdminTrainingEditCtrl'
                    }
                },
                url: '/:id/edit',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.training.view({id: trainingContent.id})',
                    label: 'Modification'
                },
                tfMetaTags: {
                    title: 'Modification de {{trainingContent.title}} | Entrainement | Administration ',
                },
                resolve: {
                    trainingContent: function(TrainingContentService, $transition$) {
                        return TrainingContentService.getTrainingContent($transition$.params().id, false);
                    },
                    trainingContents: function(TrainingContentService) {
                        return TrainingContentService.getTrainingContents(null, null, null);
                    },
                    users: function(UserService) {
                        return UserService.getUsers('short');
                    },
                    config: function() {
                        return YAML.load('System/Transcript/toolbar.yml');
                    }
                }
            })
    }])

    .controller('AdminTrainingEditCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$timeout', '$filter', 'flash', 'Upload', 'trainingContent', 'trainingContents', 'users', 'config', function($log, $rootScope, $scope, $http, $sce, $state, $timeout, $filter, flash, Upload, trainingContent, trainingContents, users, config) {
        $scope.trainingContents = trainingContents;
        $scope.users = users;
        $scope.config = config;
        if(trainingContent !== null) {
            $log.debug(trainingContent);
            $scope.trainingContent = trainingContent;
            $scope.trainingContent.updateComment = "";

            for(let iER in $scope.trainingContent.editorialResponsibility) {
                $scope.trainingContent.editorialResponsibility[iER] = $scope.trainingContent.editorialResponsibility[iER].id;
            }
        } else {
            $scope.trainingContent = {
                title: null,
                internalGoal: null,
                editorialResponsibility: null,
                orderInTraining: null,
                pageStatus: null,
                pageType: null,
                updateComment: "Creation of the content",
                illustration: null,
                videoContainer: null,
                content: null,
                exerciseHeader: null,
                exerciseImageToTranscribe: null,
                exerciseIsSmartTEI: null,
                exerciseIsAttributesManagement: null,
                exerciseTagsList: [],
                exerciseIsLiveRender: null,
                exerciseIsHelp: null,
                exerciseIsDocumentation: null,
                exerciseIsTaxonomy: null,
                exerciseIsNotes: null,
                exerciseIsVersioning: null,
                exerciseIsComplexFields: null,
                exerciseCorrectionTranscript: null,
                exerciseCorrectionErrorsToAvoid: null
            };
            $scope.trainingContent.orderInTraining = trainingContents.length+1;
            for(let tag in $scope.config.tags) {
                $scope.trainingContent.exerciseTagsList.push(tag);
            }
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

        /* Submit management ---------------------------------------------------------------------------------------- */
        $scope.submit.action = function() {
            $scope.submit.success = false;
            $scope.submit.loading = true;
            $scope.form = {
                title: $scope.trainingContent.title,
                internalGoal: $scope.trainingContent.internalGoal,
                editorialResponsibility: $scope.trainingContent.editorialResponsibility,
                orderInTraining: $scope.trainingContent.orderInTraining,
                pageStatus: $scope.trainingContent.pageStatus,
                pageType: $scope.trainingContent.pageType,
                updateComment: $scope.trainingContent.updateComment,
                illustration: $scope.trainingContent.illustration,
                videoContainer: $scope.trainingContent.videoContainer,
                content: $scope.trainingContent.content,
                exerciseHeader: $scope.trainingContent.exerciseHeader,
                exerciseImageToTranscribe: $scope.trainingContent.exerciseImageToTranscribe,
                exerciseIsSmartTEI: $scope.trainingContent.exerciseIsSmartTEI,
                exerciseIsAttributesManagement: $scope.trainingContent.exerciseIsAttributesManagement,
                exerciseTagsList: $scope.trainingContent.exerciseTagsList,
                exerciseIsLiveRender: $scope.trainingContent.exerciseIsLiveRender,
                exerciseIsHelp: $scope.trainingContent.exerciseIsHelp,
                exerciseIsDocumentation: $scope.trainingContent.exerciseIsDocumentation,
                exerciseIsTaxonomy: $scope.trainingContent.exerciseIsTaxonomy,
                exerciseIsNotes: $scope.trainingContent.exerciseIsNotes,
                exerciseIsVersioning: $scope.trainingContent.exerciseIsVersioning,
                exerciseIsComplexFields: $scope.trainingContent.exerciseIsComplexFields,
                exerciseCorrectionTranscript: $scope.trainingContent.exerciseCorrectionTranscript,
                exerciseCorrectionErrorsToAvoid: $scope.trainingContent.exerciseCorrectionErrorsToAvoid
            };

            if($scope.trainingContent.id === null || $scope.trainingContent.id === undefined) {
                /* If trainingContent.id == null > The trainingContent doesn't exist, we post it */
                $http.post($rootScope.api+'/training-contents', $scope.form).
                then(function (response) {
                    $log.debug(response.data);
                    flash.success = "Vous allez être redirigé dans quelques instants ...";
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    $state.go('transcript.admin.training.view', {id: response.data.id});
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
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
                    $log.debug(response);
                });
            } else if($scope.trainingContent.id !== null && $scope.trainingContent.id !== undefined) {
                /* If content.id != null > The trainingContent already exists, we just patch it */

                $http.patch($rootScope.api+'/training-contents/'+$scope.trainingContent.id, $scope.form).
                then(function (response) {
                    $log.debug(response.data);
                    flash.success = "Votre contenu a bien été mis à jour";
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    $timeout(function() {
                        $scope.submit.success = false;
                    }, 5000);
                }, function errorCallback(response) {
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
                    $scope.submit.loading = false;
                    $log.debug(response);
                });
            }
        };
        /* End: Submit management ----------------------------------------------------------------------------------- */

        /* Remove management ---------------------------------------------------------------------------------------- */
        $scope.remove.action = function() {
            $scope.remove.loading = true;
            $http.delete($rootScope.api+'/training-contents/'+$scope.trainingContent.id).
            then(function (response) {
                flash.success = "Votre contenu a bien été supprimé";
                flash.success = $sce.trustAsHtml(flash.success);
                $scope.submit.loading = false;
                $state.go('transcript.admin.training.list');
            }, function errorCallback(response) {
                $scope.validation.loading = false;
                $log.debug(response);
            });

        };
        /* End: Remove management ----------------------------------------------------------------------------------- */

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
            let url = "/media-contents?type=TrainingContent&field=illustration";
            if($scope.trainingContent.id !== undefined && $scope.trainingContent.id !== null) {
                url = "/media-contents?type=TrainingContent&field=illustration&id="+$scope.trainingContent.id;
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

                if($scope.trainingContent.id !== undefined && $scope.trainingContent.id !== null) {
                    $scope.trainingContent.illustration = response.data.illustration;
                } else {
                    $scope.trainingContent.illustration = response.data;
                }
            }, function errorCallback(error) {
                $log.debug(error);
                $scope.media.submit.loading = false;
            });
        }
        /* End: Upload new media ------------------------------------------------------------------------------------ */
    }])
;