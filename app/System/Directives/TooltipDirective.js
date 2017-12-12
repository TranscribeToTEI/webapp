'use strict';

angular.module('transcript.directive.tooltip', ['ui.router'])

    .directive('$log', 'tooltip', [function ($log) {
        return function (scope, element, attrs) {
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    }])

;