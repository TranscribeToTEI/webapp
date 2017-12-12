'use strict';

angular.module('transcript.filter.imageRender', ['ui.router'])

    .filter('imageRender', ['$log', '$rootScope', function($log, $rootScope) {
        return function (url) {
            if(/^http/.test(url)) {
                return url;
            } else {
                return $rootScope.api_web+'/uploads/'+url;
            }
        }
    }])

;