angular.module('fireCardsApp', ['ngRoute'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'LoginController',
                templateUrl: 'login.html'
            })
            .when('/contactList', {
                controller: 'ContactListController',
                templateUrl: 'contactList.html'
            })
            .when('/contact/:fullName', {
                controller: 'ContactDetailsController',
                templateUrl: 'contactDetails.html'
            })
    })
    .config(function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^(tel|sms|mailto):/);
    })
    .controller('LoginController', function ($scope, $location, cardDav) {
        $scope.connect = function () {
            cardDav.connect(
                $scope.serverAddress,
                $scope.username,
                $scope.password
            );

            $location.path("/contactList");
            // TODO Go to ContactListController
        }
    })
    .controller('ContactListController', function($scope, cardDav) {
        var allContacts = cardDav.listAllContacts();

        $scope.contactList = allContacts;

        $scope.clearSearch = function () {
            console.info("Clear search terms");

            $scope.searchTerms = "";
        };

        $scope.filterList = function () {
            console.info("Filter contact list");

            var searchTerms = $scope.searchTerms.toLowerCase();

            if ($scope.searchTerms == "") {
                $scope.contactList = allContacts;
            } else {
                $scope.contactList = allContacts.filter(function (contact) {
                    var fullString = contact.fullName.toLowerCase() + " " +
                        contact.phoneNumber + " " +
                        contact.email;

                    return fullString.indexOf(searchTerms) !== -1;
                });
            }
        };

        $scope.selectContact = function (contact) {
            console.info("Select contact");
        };
    })
    .controller('ContactDetailsController', function ($scope, $routeParams, cardDav) {
        $scope.contact = cardDav.contactByName($routeParams.fullName);
    })
    .factory('cardDav', function () {
        return {
            connect: function (serverAddr, username, password) {
                console.info("Connecting to " + serverAddr);
            },
            listAllContacts: function () {
                return [
                    {
                        fullName: "Fox Thered",
                        phoneNumber: "+4487967578",
                        selected: true
                    },
                    {
                        fullName: "Antoine d'Otreppe",
                        phoneNumber: "+32478625648",
                        email: "a.dotreppe@aspyct.org",
                        selected: true
                    }
                ];
            },
            contactByName: function (fullName) {
                var i,
                    allContacts,
                    contact;

                allContacts = this.listAllContacts();

                for (i = 0; i < allContacts.length; i += 1) {
                    contact = allContacts[i];

                    if (contact.fullName == fullName) {
                        return contact;
                    }
                }

                return null;
            }
        };
    });

