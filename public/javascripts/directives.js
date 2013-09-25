'use strict';

/* Directives */

app.directive("userimage", function (UserImageService) {
	return {
		restrict: "E",
		scope: {
			img: "=",
			color: "=",
			username: "=",
			size: "=",
		},
		templateUrl: "partials/userimage.html",
		controller: function ($scope) {
			$scope.img_url = null;
			$scope.default_size = "64";
			$scope.$watch('img', function() {
				if ($scope.img)
					UserImageService.img_src ($scope.img, function (img_url) {
						if (img_url)
							$scope.img_url = img_url;
					});
			});
			$scope.symbol = "?";
			$scope.$watch('username', function() {
				if (typeof($scope.username) != 'undefined' && $scope.username.length > 0)
					$scope.symbol = $scope.username.charAt(0);
			});
			if (typeof($scope.color) == 'undefined' || $scope.color.length <= 0)
				$scope.color = "white";
		}
	}
});

app.directive("switchbutton", [function () {
	return {
		restrict: "E",
		scope: {
			active: "=",
		},
		controller: ['$scope', '$element', function ($scope, $element) {
			$scope.toggleButton = function() {
				$scope.active = !$scope.active;
				console.log("toogle button!");
			}
		}]
	}
}]);

app.directive("flash", [function () {
	return {
		restrict: "E",
		controller: ['$scope', '$element', 'FlashService', function ($scope, $element, FlashService) {
			$scope.close = function() {
				FlashService.clear();
			}
		}]
	}
}]);