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
                        return YAML.load('App/Transcript/toolbar.yml');
                    }
                }
            })
    }])

    .controller('AdminTrainingEditCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$timeout', 'flash', 'trainingContent', 'trainingContents', 'users', 'config', function($rootScope, $scope, $http, $sce, $state, $timeout, flash, trainingContent, trainingContents, users, config) {
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
                content: $scope.trainingContent.content
            };
            if($scope.trainingContent.exercise !== undefined && $scope.trainingContent.exercise !== null) {
                $scope.form.exerciseHeader = $scope.trainingContent.exercise.header;
                $scope.form.exerciseImageToTranscribe = $scope.trainingContent.exercise.imageToTranscribe;
                $scope.form.exerciseIsSmartTEI = $scope.trainingContent.exercise.preferences.isSmartTEI;
                $scope.form.exerciseIsAttributesManagement = $scope.trainingContent.exercise.preferences.isAttributesManagement;
                $scope.form.exerciseTagsList = $scope.trainingContent.exercise.preferences.activeTags;
                $scope.form.exerciseIsLiveRender = $scope.trainingContent.exercise.preferences.isLiveRender;
                $scope.form.exerciseIsHelp = $scope.trainingContent.exercise.preferences.isHelp;
                $scope.form.exerciseIsDocumentation = $scope.trainingContent.exercise.preferences.isDocumentation;
                $scope.form.exerciseIsTaxonomy = $scope.trainingContent.exercise.preferences.isTaxonomy;
                $scope.form.exerciseIsBibliography = $scope.trainingContent.exercise.preferences.isBibliography;
                $scope.form.exerciseIsNotes = $scope.trainingContent.exercise.preferences.isNotes;
                $scope.form.exerciseIsVersioning = $scope.trainingContent.exercise.preferences.isVersioning;
                $scope.form.exerciseIsComplexFields = $scope.trainingContent.exercise.preferences.isComplexFields;
                $scope.form.exerciseCorrectionTranscript = $scope.trainingContent.exercise.correction.transcript;
                $scope.form.exerciseCorrectionErrorsToAvoid = $scope.trainingContent.exercise.correction.errorsToAvoid;
                console.log($scope.trainingContent.exercise.preferences.activeTags);
            }

            if($scope.trainingContent.id === null || $scope.trainingContent.id === undefined) {
                /* If trainingContent.id == null > The trainingContent doesn't exist, we post it */
                $http.post($rootScope.api+'/training-contents', $scope.form).
                then(function (response) {
                    console.log(response.data);
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
                    console.log(response);
                });
            } else if($scope.trainingContent.id !== null && $scope.trainingContent.id !== undefined) {
                /* If content.id != null > The trainingContent already exists, we just patch it */

                $http.patch($rootScope.api+'/training-contents/'+$scope.trainingContent.id, $scope.form).
                then(function (response) {
                    console.log(response.data);
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

        /* Media management ----------------------------------------------------------------------------------------- */
        $scope.media.submit.action = function(type) {
            let picture = null;
            if(type === 'illustration') {
                $scope.media.submit.loading.illustration = true;
                picture = $scope.media.form.illustration;
            } else if(type === 'exerciseImageToTranscribe') {
                $scope.media.submit.loading.exerciseImageToTranscribe = true;
                picture = $scope.media.form.exerciseImageToTranscribe;
            }

            upload(type, picture);
        };

        function upload(type, picture) {
            Upload.upload = Upload.upload({
                url: $rootScope.api+"/media-contents?type=TrainingContent&field="+type+"&id="+$scope.trainingContent.id,
                data: {media: picture}
            }).then(function (response) {
                console.log(response);
                if(type === 'illustration') {
                    $scope.media.submit.loading.illustration = false;
                    $scope.trainingContent.illustration = response.data.illustration;
                } else if(type === 'exerciseImageToTranscribe') {
                    $scope.media.submit.loading.exerciseImageToTranscribe = false;
                    $scope.trainingContent.exerciseImageToTranscribe = response.data.exerciseImageToTranscribe;
                }
            }, function errorCallback(error) {
                console.log(error);
                if(type === 'illustration') { $scope.media.submit.loading.illustration = false;}
                else if(type === 'exerciseImageToTranscribe') { $scope.media.submit.loading.exerciseImageToTranscribe = false;}
            });
        }
        /* End: Media management ------------------------------------------------------------------------------------ */
    }])
;