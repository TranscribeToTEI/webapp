'use strict';

angular.module('transcript.filter.ucFirstStrict', ['ui.router'])

    .filter('ucFirstStrict', ['$log', function($log) {
        return function (string) {
            if(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            } else {
                return null;
            }
        }
    }])

;