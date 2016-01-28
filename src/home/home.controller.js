import _ from 'lodash';
import countries from './countries.json';

const INITIAL_CORDS = {
    lat: -25.363,
    lng: 131.044
};
const INITIAL_ZOOM = 2;
const MARKER_ZOOM = 4;

export default class HomeController {
    constructor($scope, ShipsService) {
        // required evil
        this._$scope = $scope;
        this.service = ShipsService;

        this.editingShip = null;
        this.isEditingShip = false;
        this.loadingShipDetails = '';
        this.shipDetails = null;

        // Create a map object and specify the DOM element for display.
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: INITIAL_CORDS,
            scrollwheel: true,
            zoom: INITIAL_ZOOM
        });
        this.service.fetchLocations().then(locations => {
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
    }

    loadShipData(ship) {
        this.service.getShipData(ship._id).then(response => {
            this._originalData = response.data;
            this.shipDetails = _.cloneDeep(response.data);
            this.loadingShipDetails = '';
        });
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
        this.loadingShipDetails = 'Please wait while getting ship information';
        this.loadShipData(ship);

        // because this is async -trigger digest
        this._$scope.$apply();
    }

    saveShip() {
        const ship = this.shipDetails;
        this.loadingShipDetails = 'Saving ship information';
        this.service.saveShip(ship).then(() => {
            this.doneEditing();
        });
    }

    getAlphaFlag(country) {
        if (!country) {
            return;
        }
        // manipulations in order to get the country flag
        const name = country
            .replace(/\s+/g, '')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(str) {
                return str.toUpperCase();
            })
            .trim();

        const item = _.find(countries, {
            name
        });
        if (!item) {
            return null;
        }
        const cc = item.alpha2.toLowerCase();
        return `flag-${cc}`;
    }

    doneEditing() {
        const { zoom, position } = this.previousDetails;

        this.isEditingShip = false;
        this.loadingShipDetails = '';
        this.shipDetails = null;
        this.editingShip = null;

        this.map.setZoom(zoom);
        this.map.panTo(position);
    }
}
