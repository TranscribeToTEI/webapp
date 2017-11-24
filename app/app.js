'use strict';

angular.module('transcriptApp', [
        'ui.router',
        'ui.ace',
        'ngRoute',
        'ngAnimate',
        'ngCookies',
        'ckeditor',
        'angular-oauth2',
        'http-auth-interceptor',
        'angular-flash.service',
        'angular-flash.flash-alert-directive',
        'ui.bootstrap',
        'ui.openseadragon',
        'ncy-angular-breadcrumb',
        'ngFileUpload',
        'angucomplete',
        'leaflet-directive',
        'angular.filter',
        'prettyXml',
        'permission',
        'permission.ui',
        'angular-loading-bar',
        'tf.metatags',
        'transcript',
        'transcript.admin',
        'transcript.admin.comments',
        'transcript.admin.content',
        'transcript.admin.content.edit',
        'transcript.admin.content.history',
        'transcript.admin.content.list',
        'transcript.admin.entity',
        'transcript.admin.entity.edit',
        'transcript.admin.entity.import',
        'transcript.admin.entity.list',
        'transcript.admin.hosting-organization',
        'transcript.admin.hosting-organization.edit',
        'transcript.admin.hosting-organization.list',
        'transcript.admin.home',
        'transcript.admin.preference',
        'transcript.admin.taxonomy',
        'transcript.admin.taxonomy.access',
        'transcript.admin.taxonomy.logs',
        'transcript.admin.training',
        'transcript.admin.training.edit',
        'transcript.admin.training.home',
        'transcript.admin.training.list',
        'transcript.admin.training.view',
        'transcript.admin.transcript',
        'transcript.admin.transcript.export',
        'transcript.admin.transcript.validation',
        'transcript.admin.user',
        'transcript.admin.user.list',
        'transcript.admin.user.view',
        'transcript.admin.will-type',
        'transcript.admin.will-type.list',
        'transcript.admin.will-type.edit',
        'transcript.app',
        'transcript.app.blog',
        'transcript.app.contact',
        'transcript.app.content',
        'transcript.app.edition',
        'transcript.app.entity',
        'transcript.app.home',
        'transcript.app.hosting-organization',
        'transcript.app.hosting-organization.list',
        'transcript.app.hosting-organization.view',
        'transcript.app.search',
        'transcript.app.security',
        'transcript.app.security.check',
        'transcript.app.security.confirm',
        'transcript.app.security.login',
        'transcript.app.security.logout',
        'transcript.app.security.register',
        'transcript.app.security.resetting',
        'transcript.app.security.resetting.check',
        'transcript.app.security.resetting.request',
        'transcript.app.security.resetting.reset',
        'transcript.app.taxonomy',
        'transcript.app.taxonomy.ask',
        'transcript.app.taxonomy.edit',
        'transcript.app.taxonomy.home',
        'transcript.app.taxonomy.list',
        'transcript.app.taxonomy.view',
        'transcript.app.training',
        'transcript.app.transcript',
        'transcript.app.user',
        'transcript.app.user.avatar',
        'transcript.app.user.change-password',
        'transcript.app.user.edit',
        'transcript.app.user.preferences',
        'transcript.app.user.private-message',
        'transcript.app.user.private-message.list',
        'transcript.app.user.private-message.thread',
        'transcript.app.user.profile',
        'transcript.system.comment',
        'transcript.system.error',
        'transcript.system.error.403',
        'transcript.system.error.404',
        'transcript.directive.compile',
        'transcript.directive.mwConfirmClick',
        'transcript.filter.arrayRender',
        'transcript.filter.booleanRender',
        'transcript.filter.classicDate',
        'transcript.filter.contentTypeName',
        'transcript.filter.imageRender',
        'transcript.filter.resourceTypeName',
        'transcript.filter.taxonomyEntityNameConstruct',
        'transcript.filter.taxonomyName',
        'transcript.filter.trainingTypePageName',
        'transcript.filter.transcriptionStatusName',
        'transcript.filter.trustAsHtml',
        'transcript.filter.roleName',
        'transcript.filter.status',
        'transcript.filter.ucFirstStrict',
        'transcript.filter.willNumberFormat',
        'transcript.filter.userIDFromName',
        'transcript.service.access',
        'transcript.service.app',
        'transcript.service.bibliography',
        'transcript.service.comment',
        'transcript.service.comment-log',
        'transcript.service.contact',
        'transcript.service.content',
        'transcript.service.data-interface',
        'transcript.service.entity',
        'transcript.service.geonames',
        'transcript.service.hosting-organization',
        'transcript.service.image',
        'transcript.service.log',
        'transcript.service.note',
        'transcript.service.resource',
        'transcript.service.search',
        'transcript.service.taxonomy',
        'transcript.service.training-content',
        'transcript.service.transcript',
        'transcript.service.transcript-log',
        'transcript.service.user',
        'transcript.service.user-preference',
        'transcript.service.will',
        'transcript.service.will-type'
    ]).
    config(['$stateProvider','$httpProvider', '$urlRouterProvider', '$qProvider', '$injector', 'flashProvider', 'tfMetaTagsProvider', 'OAuthTokenProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $qProvider, $injector, flashProvider, tfMetaTagsProvider, OAuthTokenProvider) {
        $urlRouterProvider.otherwise('/');
        //$urlRouterProvider.deferIntercept();
        $qProvider.errorOnUnhandledRejections(false);

        OAuthTokenProvider.configure({
            name: "transcript_security_token_access",
            options: {
                secure: false,
            }
        });

        /* ------------------------------------------------------ */
        /* Flash management */
        /* ------------------------------------------------------ */
        flashProvider.errorClassnames.push('alert-danger');
        flashProvider.warnClassnames.push('alert-warning');
        flashProvider.infoClassnames.push('alert-info');
        flashProvider.successClassnames.push('alert-success');
        /* ------------------------------------------------------ */

        /* ------------------------------------------------------ */
        /* Meta tag management */
        /* ------------------------------------------------------ */
        tfMetaTagsProvider.setDefaults({
            title: 'Testaments de Poilus',
            properties: {
                keywords: 'keyword1, keyword2'
            }
        });
        tfMetaTagsProvider.setTitleSuffix('');
        tfMetaTagsProvider.setTitlePrefix('');
        /* ------------------------------------------------------ */


    }])
    .run(['$rootScope', '$http', '$injector', '$location', 'authService', '$state', '$cookies', '$filter', '$window', 'PermRoleStore', 'PermPermissionStore', 'UserService', 'OAuth', 'OAuthToken', function($rootScope, $http, $injector, $location, authService, $state, $cookies, $filter, $window, PermRoleStore, PermPermissionStore, UserService, OAuth, OAuthToken) {
        /* -- Parameters management ------------------------------------------------------ */
        let parameters = YAML.load('parameters.yml');
        $rootScope.version = parameters.version;
        $rootScope.api = parameters.api;
        $rootScope.api_web = parameters.api_web;
        $rootScope.webapp = {
            strict: parameters.webapp.strict,
            resources: parameters.webapp.resources
        };
        $rootScope.siteURL = parameters.siteURL;
        $rootScope.client_id = parameters.client_id;
        $rootScope.client_secret = parameters.client_secret;
        /* -- End : Parameters management ------------------------------------------------ */

        /* -- OAuth management ----------------------------------------------------------- */
        OAuth.configure({
            baseUrl: $rootScope.api,
            clientId: $rootScope.client_id,
            clientSecret: $rootScope.client_secret,
            grantPath: '/oauth/v2/token',
        });


        $rootScope.$on('oauth:error', function(event, rejection) {
            // Ignore `invalid_grant` error - should be catched on `LoginController`.
            if ('invalid_grant' === rejection.data.error) {
                return;
            }

            // Refresh token when a `invalid_token` error occurs.
            if ('invalid_token' === rejection.data.error) {
                return OAuth.getRefreshToken();
            }

            // Redirect to `/login` with the `error_reason`.
            return $state.go('transcrip.app.security.login'); // Need to handle error : rejection.data.error
        });
        /* -- End : OAuth management ----------------------------------------------------- */

        /* -- Token management ----------------------------------------------------------- */
        /*if($cookies.get($rootScope.version+'_transcript_security_token_access') !== undefined) {
            $rootScope.oauth = {
                access_token: $cookies.get($rootScope.version+'_transcript_security_token_access'),
                refresh_token: $cookies.get($rootScope.version+'_transcript_security_token_refresh'),
                token_type: $cookies.get($rootScope.version+'_transcript_security_token_type')
            };
        }*/
        /* -- End : Token management ----------------------------------------------------- */

        /* -- Permission management ------------------------------------------------------ */
        PermPermissionStore
            .definePermission('adminAccess', function () {
                if($rootScope.user !== undefined) {
                    return ($rootScope.user !== undefined && $filter('contains')($rootScope.user.roles, 'ROLE_ADMIN'));
                } else {
                    return UserService.getCurrent().then(function() {
                        console.log(!!($rootScope.user !== undefined && $filter('contains')($rootScope.user.roles, 'ROLE_ADMIN')));
                        return ($rootScope.user !== undefined && $rootScope.user.roles !== undefined && $filter('contains')($rootScope.user.roles, 'ROLE_ADMIN'));
                    });
                }
            });
        PermPermissionStore
            .definePermission('transcriptAccess', function () {
                if($rootScope.user !== undefined) {
                    return ($rootScope.user !== undefined);
                } else {
                    return UserService.getCurrent().then(function() {
                        console.log($rootScope.user);
                        return ($rootScope.user !== undefined);
                    });
                }
            });

        PermRoleStore
            .defineManyRoles({
                'ROLE_ADMIN': ['adminAccess', 'transcriptAccess'],
                'ROLE_USER': ['transcriptAccess']
            });
        /* -- End : Permission management ------------------------------------------------ */

        /* -- Resource label management -------------------------------------------------- */
        $rootScope.getStatusClassLabel = function(status) {
            if(status === "todo") {return "badge-danger";}
            else if(status === "transcription") {return "badge-warning";}
            else if(status === "validation") {return "badge-info";}
            else if(status === "validated") {return "badge-success";}
            else{return "badge-danger";}
        };
        $rootScope.getStatusLabel = function(status) {
            if(status === "todo") {return "à faire";}
            else if(status === "transcription") {return "en cours";}
            else if(status === "validation") {return "en validation";}
            else if(status === "validated") {return "validé";}
            else{return "Inconnu";}
        };
        /* -- End : Resource label management -------------------------------------------- */


        $('[data-toggle="tooltip"]').tooltip();
        $('.tooltip').tooltip();
    }])
;