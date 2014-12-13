'use strict';

var intercom = Intercom.getInstance();

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope', function ($scope) {
	try {
		$scope.taleliste = JSON.parse(localStorage.taleliste);
	}
	catch(err) {
		$scope.taleliste = [];
	}

	try {
		$scope.activeSpeaker = JSON.parse(localStorage.activeSpeaker);
	}
	catch(err) {
		$scope.activeSpeaker = {};
	}
intercom.on('taleliste', function(data) {
	$scope.taleliste = JSON.parse(localStorage.taleliste);
	$scope.$apply();
});
intercom.on('activeSpeaker', function(data) {
	$scope.activeSpeaker = JSON.parse(localStorage.activeSpeaker);
	$scope.$apply();
});
}]);



/*angular.element($window).on('storage', function(event) {
	if (event.key == 'taleliste') {
		$scope.taleliste = localStorage.taleliste;
	}
	if (event.key == 'activeSpeaker') {
		$scope.activeSpeaker = localStorage.activeSpeaker;
	}
});*/