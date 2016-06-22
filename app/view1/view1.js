'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl',
    controllerAs: 'ctrl'
  });
}])

.controller('View1Ctrl', function() {
  var self = this;
  self.twenty = 20;
});
