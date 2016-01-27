const INITIAL_ZOOM = 2;
const MARKER_ZOOM = 4;

// setup map
var INITIAL_CORDS = {
    lat: -25.363,
    lng: 131.044
};

export default class HomeController {
    constructor($scope, ShipsService) {
        // required evil
        this._$scope = $scope;

        // Create a map object and specify the DOM element for display.
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: INITIAL_CORDS,
            scrollwheel: true,
            zoom: INITIAL_ZOOM
        });
        ShipsService.fetchLocations().then(locations => {
            const ships = locations.data;
            ships.forEach(ship => {
                const position = ship.lastpos.geometry.coordinates;
                const id = ship._id;
                var marker = new google.maps.Marker({
                    map: this.map,
                    position: {
                        lat: position[1],
                        lng: position[0]
                    },
                    title: id
                });
                marker.addListener('click', () => this.editShip(ship, marker));
            });
        });

        this.loadShipData = (ship) => {
            ShipsService.getShipData(ship._id).then(extraData => {
                console.log(extraData);
            });
        };
    }

    editShip(ship, marker) {
        this.previousDetails = {
            zoom: this.map.getZoom(),
            position: this.map.getCenter()
        };

        this.map.setZoom(MARKER_ZOOM);
        this.map.setCenter(marker.getPosition());

        this.isEditingShip = true;
        this.editingShip = ship;
        this.loadingShipDetails = true;
        this.loadShipData(ship);

        // because this is async -trigger digest
        this._$scope.$apply();
    }


    doneEditing() {
        const { zoom, position } = this.previousDetails;
        this.isEditingShip = false;
        this.editingShip = null;

        this.map.setZoom(zoom);
        this.map.panTo(position);
    }
}
