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
                    var lowerName = contact.fullName.toLowerCase()
                    return lowerName.indexOf(searchTerms) !== -1;
                });
            }
        };

        $scope.selectContact = function (contact) {
            console.info("Select contact");
        };
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
                        selected: true
                    }
                ];
            }
        };
    });

