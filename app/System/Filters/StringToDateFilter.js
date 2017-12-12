'use strict';

angular.module('transcript.filter.stringToDate', ['ui.router'])

    .filter('stringToDate', ['$log', function($log) {
        return function (string) {
            if(string) {
                return new Date(string);
            } else {
                return null;
            }

        }
    }])

;