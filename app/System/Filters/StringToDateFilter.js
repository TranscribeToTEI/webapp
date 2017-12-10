'use strict';

angular.module('transcript.filter.stringToDate', ['ui.router'])

    .filter('stringToDate', [function() {
        return function (string) {
            if(string) {
                return new Date(string);
            } else {
                return null;
            }

        }
    }])

;