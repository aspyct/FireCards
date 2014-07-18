angular.module('fireCardsApp', [])
    .controller('FireCardsController', function($scope) {
        $scope.newContacts = [
            {
                fullName: "Antoine d'Otreppe",
                phoneNumber: "+32478625648",
                selected: true
            }
        ];

        $scope.updatedContacts = $scope.newContacts;
    });

