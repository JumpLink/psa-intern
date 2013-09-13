'use strict';

/* Directives */
app.directive("userimage", function (UserImageService) {
	return {
		restrict: "E",
		scope: {
			img: "=",
			color: "=",
			username: "="
		},
		templateUrl: "partials/userimage.html",
		controller: function ($scope) {
			$scope.img_url = null;
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