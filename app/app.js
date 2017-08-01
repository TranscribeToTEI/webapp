'use strict';

angular.module('transcriptApp', [
    'ui.router',
    'ui.ace',
    'ngRoute',
    'ngCookies',
    'ckeditor',
    'http-auth-interceptor',
    'angular-flash.service',
    'angular-flash.flash-alert-directive',
    'ui.bootstrap',
    'ui.openseadragon',
    'ncy-angular-breadcrumb',
    'transcript.admin',
    'transcript.admin.content',
    'transcript.admin.content.edit',
    'transcript.admin.content.list',
    'transcript.admin.entity',
    'transcript.admin.entity.edit',
    'transcript.admin.entity.import',
    'transcript.admin.entity.list',
    'transcript.admin.home',
    'transcript.admin.preference',
    'transcript.admin.transcript',
    'transcript.admin.transcript.export',
    'transcript.admin.transcript.validation',
    'transcript.admin.user',
    'transcript.admin.user.list',
    'transcript.admin.user.view',
    'transcript.app',
    'transcript.app.blog',
    'transcript.app.contact',
    'transcript.app.content',
    'transcript.app.entity',
    'transcript.app.home',
    'transcript.app.search',
    'transcript.app.security',
    'transcript.app.security.check',
    'transcript.app.security.confirm',
    'transcript.app.security.login',
    'transcript.app.security.logout',
    'transcript.app.security.register',
    'transcript.app.thesaurus',
    'transcript.app.thesaurus.create',
    'transcript.app.thesaurus.edit',
    'transcript.app.thesaurus.home',
    'transcript.app.thesaurus.list',
    'transcript.app.thesaurus.view',
    'transcript.app.training',
    'transcript.app.transcript',
    'transcript.app.user',
    'transcript.app.user.edit',
    'transcript.app.user.preferences',
    'transcript.app.user.profile',
    'transcript.system.comment',
    'transcript.system.error',
    'transcript.system.error.403',
    'transcript.system.error.404',
    'transcript.system.navbar'
]).
config(['$stateProvider','$httpProvider', '$urlRouterProvider', '$qProvider', '$injector', 'flashProvider', function($stateProvider, $httpProvider, $urlRouterProvider, $qProvider, $injector, flashProvider) {
    $urlRouterProvider.otherwise('/');
    $qProvider.errorOnUnhandledRejections(false);

    flashProvider.errorClassnames.push('alert-danger');
    flashProvider.warnClassnames.push('alert-warning');
    flashProvider.infoClassnames.push('alert-info');
    flashProvider.successClassnames.push('alert-success');

}])
.run(['$rootScope', '$http', '$injector', '$location', 'authService', '$state', '$cookies', function($rootScope, $http, $injector, $location, authService, $state, $cookies) {
    $rootScope.api = "http://localhost:8888/TestamentsDePoilus/api/web/app_dev.php";
    $rootScope.api_web = "http://localhost:8888/TestamentsDePoilus/api/web/";
    $rootScope.webapp = {
        strict: "http://localhost:8888/TestamentsDePoilus/webapp/app/#!/",
        resources: "http://localhost:8888/TestamentsDePoilus/webapp/app/web/"
    };
    $rootScope.siteURL = "http://testament-de-poilus.huma-num.fr";

    if($cookies.get('transcript_security_token_access') !== undefined) {
        $rootScope.oauth = {
            access_token: $cookies.get('transcript_security_token_access'),
            refresh_token: $cookies.get('transcript_security_token_refresh'),
            token_type: $cookies.get('transcript_security_token_type')
        };
    }

    $rootScope.isAdmin = function() {
        if($rootScope.user === undefined) {return false;}

        return ($.inArray("ROLE_ADMIN", $rootScope.user.roles) !== -1);
    };
}])
.directive('compile', ['$compile', function ($compile) {
    return function (scope, element, attrs) {
        scope.$watch(
            function (scope) {
                return scope.$eval(attrs.compile);
            },
            function (value) {
                element.html(value);
                $compile(element.contents())(scope);
            }
        )
    }
}]);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}