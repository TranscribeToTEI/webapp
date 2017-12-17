'use strict';

angular.module('transcript.filter.shuffle', ['ui.router'])

    .filter('shuffle', [function() {
        return function (data) {
            let m = data.length, t, i;

            while(m) {
                i = Math.floor(Math.random() * m--);
                t = data[m];
                data[m] = data[i];
                data[i] = t;
            }

            return data;
        }
    }])

;