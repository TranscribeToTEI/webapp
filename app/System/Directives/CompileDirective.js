'use strict';

angular.module('transcript.directive.compile', ['ui.router'])

    .directive('compile', ['$log', '$compile', function ($log, $compile) {
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
    }])

;