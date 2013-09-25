'use strict';
/* App Module */
var app = angular.module("app", ['ngSanitize', 'angularFileUpload', 'colorpicker.module', 'pascalprecht.translate', 'ui.bootstrap.dropdownToggle']);
app.constant('userImagePath', 'images/users');

app.config(function($routeProvider) {

	$routeProvider.when('/notfound', {
		templateUrl: 'notfound.html'
	});

	$routeProvider.when('/loggedout', {
		templateUrl: 'loggedout.html'
	});

	$routeProvider.when('/login', {
		templateUrl: 'login.html',
		controller: 'LoginController'
	});

	$routeProvider.when('/about', {
		templateUrl: 'about.html',
		controller: 'AboutController'
	});

	$routeProvider.when('/messages', {
		templateUrl: 'messages.html',
		controller: 'MessageController',
		resolve: {
			messages : function(MessageService) {
				return MessageService.getLatest();
			}
		}
	});

	$routeProvider.when('/user/:email', {
		templateUrl: 'user.html',
		controller: 'UserController'
	});

	$routeProvider.when('/users', {
		templateUrl: 'users.html',
		controller: 'UsersController',
		resolve: {
			users : function(UsersService) {
				return UsersService.getUsers();
			}
		}
	});

	$routeProvider.otherwise({ redirectTo: '/notfound' });
});

app.config(['$translateProvider', function ($translateProvider) {
  $translateProvider.translations('en',{
    NAV_MESSAGES:              'Messages',
    NAV_ABOUT:                 'About',
    NAV_USERS:                 'Users',
    NAV_BRAND:                 'PSA - internal',
    BTN_LOGOUT:                'Logout',
    BTN_SAVE:                  'Save',
    BTN_REMOVE:                'Remove',
    BTN_CREATE:                'Create',
    BTN_SEND:                  'Send',
    BTN_EDIT:                  'Edit',
    BTN_SIGNIN:                'Sign in',
    LBL_EMAIL:                 'Email address',
    LBL_NAME:                  'Name',
    LBL_PWD:                   'Password',
    LBL_COLOR:                 'Color',
    LBL_IMG:                   'Image',
    LBL_IMG_NUM:               'Number of images',
    LBL_FILENAME:              'Filename',
    LBL_FILESIZE:              'Filesize',
    LBL_UPLOADED:              'Uploaded',
    LBL_REMEMBER:              'Keep Me Logged In',
    PLACEHOLDER_EMAIL:         'Enter E-Mail',
    PLACEHOLDER_NAME:          'Enter Name',
    PLACEHOLDER_PWD:           'Enter Password',
    TXT_SIGNED:                'Signed in as ',
    TXT_SIGNIN:                'Please sign in',
    TXT_NOTSIGNED:             'You are not signed in ',
    TXT_NEWUSER:               'creates new user',
    TITLE_AVAILABLE_USERS:     'available users',
    TITLE_NEWUSER:             'create new user',
  });
  $translateProvider.translations('de',{
    NAV_MESSAGES:              'Nachrichten',
    NAV_ABOUT:                 'Über',
    NAV_USERS:                 'Benutzer',
    NAV_BRAND:                 'PSA - intern',
    BTN_LOGOUT:                'Abmelden',
    BTN_SAVE:                  'Speichern',
    BTN_REMOVE:                'Entfernen',
    BTN_CREATE:                'Erstellen',
    BTN_SEND:                  'Senden',
    BTN_EDIT:                  'Bearbeiten',
    BTN_SIGNIN:                'Anmelden',
    LBL_EMAIL:                 'E-Mail Adresse',
    LBL_NAME:                  'Name',
    LBL_PWD:                   'Passwort',
    LBL_COLOR:                 'Farbe',
    LBL_IMG:                   'Bild',
    LBL_IMG_NUM:               'Anzahl Bilder',
    LBL_FILENAME:              'Dateiname',
    LBL_FILESIZE:              'Dateigröße',
    LBL_UPLOADED:              'Hochgeladen',
    LBL_REMEMBER:              'Angemeldet bleiben',
    PLACEHOLDER_EMAIL:         'E-Mail angeben',
    PLACEHOLDER_NAME:          'Name angeben',
    PLACEHOLDER_PWD:           'Passwort angeben',
    TXT_SIGNED:                'Angemeldet als ',
    TXT_SIGNIN:                'Bitte melden Sie sich an',
    TXT_NOTSIGNED:             'Du bist nicht angemeldet ',
    TXT_NEWUSER:               'erstellt neuen Benutzer',
    TITLE_AVAILABLE_USERS:     'Verfügbare Benutzer',
    TITLE_NEWUSER:             'Neuen Benutzer erstellen',
  });
  $translateProvider.preferredLanguage('en');
}]);


app.config(function($httpProvider) {
	
	var logsOutUserOn401 = function($location, $q, SessionService, FlashService) {
		var success = function(response) {
			return response;
		};
		var error	= function(response) {
			if(response.status === 401) { // HTTP NotAuthorized
				SessionService.unset('authenticated');
				$location.path('/login');
				FlashService.show(response.data.flash, "danger");
				return $q.reject(response);
			} else {
				return $q.reject(response);
			}
		};

		return function(promise) {
			return promise.then(success, error)
		};
	}

	$httpProvider.responseInterceptors.push(logsOutUserOn401);

});

app.run(function($rootScope, $location, AuthenticationService, FlashService) {

	var routesThatRequireAuth = ['/messages', '/users']; //TODO  user/:email

	$rootScope.getUser = AuthenticationService.getUser;

	$rootScope.$on('$routeChangeStart', function(event, next, current) {
		if( _(routesThatRequireAuth).contains($location.path()) && !AuthenticationService.isLoggedIn() ) {
			$location.path('/login');
			FlashService.show("Please log in to continue", "danger");
		}
	});
});