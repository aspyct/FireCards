angular.module('fireCardsApp', [])
    .controller('FireCardsController', function($scope) {
        $scope.contactList = [
            {
                fullName: "Antoine",
                phoneNumber: "+32478625648"
            }
        ];
    });

