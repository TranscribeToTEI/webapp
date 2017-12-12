'use strict';

angular.module('transcript.filter.trustAsHtml', ['ui.router'])

    .filter('trustAsHtml', ['$log', '$sce', function($log, $sce) {
        return function (value) {
            return $sce.trustAsHtml(value);
        }
    }])

;