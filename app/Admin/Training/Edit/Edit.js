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
                    title: 'Nouveau',
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
                        return YAML.load('App/Transcript/toolbar.yml');
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
                    title: 'Modification de {{trainingContent.title}}',
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
                        return YAML.load('App/Transcript/toolbar.yml');
                    }
                }
            })
    }])

    .controller('AdminTrainingEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'trainingContent', 'trainingContents', 'users', 'config', function($rootScope, $scope, $http, $sce, $state, flash, trainingContent, trainingContents, users, config) {
        $scope.trainingContents = trainingContents;
        $scope.users = users;
        $scope.config = config;
        if(trainingContent !== null) {
            console.log(trainingContent);
            $scope.trainingContent = trainingContent;
            $scope.trainingContent.updateComment = "";
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
                exercise: {
                    header: null,
                    imageToTranscribe: null,
                    preferences: {
                        isSmartTEI: null,
                        isAttributesManagement: null,
                        activeTags: null,
                        isLiveRender: null,
                        isHelp: null,
                        isDocumentation: null,
                        isTaxonomy: null,
                        isBibliography: null,
                        isNotes: null,
                        isVersioning: null,
                        isComplexFields: null
                    },
                    correction: {
                        transcript: null,
                        errorsToAvoid: null
                    }
                }

            };
            $scope.trainingContent.orderInTraining = trainingContents.length+1;
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

        /* Image loading -------------------------------------------------------------------------------------------- */
        $scope.isExternMedia = function(){
            return /^http/.test($scope.trainingContent.illustration);
        };
        /* End: Image loading --------------------------------------------------------------------------------------- */

        /* Autocompletion management -------------------------------------------------------------------------------- */
        $scope.$watch('trainingContent.editorialResponsibility', function() {
            console.log($scope.trainingContent.editorialResponsibility);
            if($scope.trainingContent.editorialResponsibility !== undefined) {
                if ($scope.trainingContent.editorialResponsibility !== null && $scope.trainingContent.editorialResponsibility !== "" && $scope.trainingContent.editorialResponsibility.originalObject !== undefined) {
                    $scope.trainingContent.editorialResponsibility = $scope.trainingContent.editorialResponsibility.originalObject.id;
                    console.log($scope.trainingContent.editorialResponsibility);
                }
            }
        });
        /* End: Autocompletion management --------------------------------------------------------------------------- */

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
                exerciseHeader: $scope.trainingContent.exercise.header,
                exerciseImageToTranscribe: $scope.trainingContent.exercise.imageToTranscribe,
                exerciseIsSmartTEI: $scope.trainingContent.exercise.preferences.isSmartTEI,
                exerciseIsAttributesManagement: $scope.trainingContent.exercise.preferences.isAttributesManagement,
                exerciseTagsList: $scope.trainingContent.exercise.preferences.activeTags,
                exerciseIsLiveRender: $scope.trainingContent.exercise.preferences.isLiveRender,
                exerciseIsHelp: $scope.trainingContent.exercise.preferences.isHelp,
                exerciseIsDocumentation: $scope.trainingContent.exercise.preferences.isDocumentation,
                exerciseIsTaxonomy: $scope.trainingContent.exercise.preferences.isTaxonomy,
                exerciseIsBibliography: $scope.trainingContent.exercise.preferences.isBibliography,
                exerciseIsNotes: $scope.trainingContent.exercise.preferences.isNotes,
                exerciseIsVersioning: $scope.trainingContent.exercise.preferences.isVersioning,
                exerciseIsComplexFields: $scope.trainingContent.exercise.preferences.isComplexFields,
                exerciseCorrectionTranscript: $scope.trainingContent.exercise.correction.transcript,
                exerciseCorrectionErrorsToAvoid: $scope.trainingContent.exercise.correction.errorsToAvoid
            };
            console.log($scope.trainingContent.exercise.preferences.activeTags);

            if($scope.trainingContent.id === null || $scope.trainingContent.id === undefined) {
                /* If trainingContent.id == null > The trainingContent doesn't exist, we post it */
                $http.post($rootScope.api+'/training-contents', $scope.form).
                then(function (response) {
                    console.log(response.data);
                    flash.success = "Votre contenu a bien été créé";
                    flash.success = $sce.trustAsHtml(flash.success);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    $state.go('transcript.admin.training.view', {id: response.data.id});
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    if(response.data.code === 400) {
                        flash.error = "<ul>";
                        for(var field in response.data.errors.children) {
                            for(var error in response.data.errors.children[field]) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                        flash.error = $sce.trustAsHtml(flash.error);
                    }
                    console.log(response);
                });
            } else if($scope.trainingContent.id !== null && $scope.trainingContent.id !== undefined) {
                /* If content.id != null > The trainingContent already exists, we just patch it */

                $http.patch($rootScope.api+'/training-contents/'+$scope.trainingContent.id, $scope.form).
                then(function (response) {
                    console.log(response.data);
                    flash.success = "Votre contenu a bien été mis à jour";
                    flash.success = $sce.trustAsHtml(flash.success);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                }, function errorCallback(response) {
                    if(response.data.code === 400) {
                        flash.error = "<ul>";
                        for(var field in response.data.errors.children) {
                            for(var error in response.data.errors.children[field]) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                        flash.error = $sce.trustAsHtml(flash.error);
                    }
                    $scope.submit.loading = false;
                    console.log(response);
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
                console.log(response);
            });

        };
        /* End: Remove management ----------------------------------------------------------------------------------- */
    }])
;