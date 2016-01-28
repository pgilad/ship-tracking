import _ from 'lodash';
import countries from './countries.json';

const INITIAL_CORDS = {
    lat: -25.363,
    lng: 131.044
};
const INITIAL_ZOOM = 2;
const MARKER_ZOOM = 5;

const MODE_IDLE = 'idle';
const MODE_EDITING = 'editing-ship';
const MODE_QUERY = 'filter-query';

export default class HomeController {
    constructor($scope, ShipsService) {
        // required evil
        this._$scope = $scope;
        this.service = ShipsService;

        this.editingShip = null;
        this.altScreenMode = MODE_IDLE;
        this.loadingShipDetails = '';
        this.shipDetails = null;

        // Create a map object and specify the DOM element for display.
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: INITIAL_CORDS,
            scrollwheel: true,
            zoom: INITIAL_ZOOM
        });
        this.service.fetchLocations().then(locations => {
            this.ships = locations.data;
            this.ships.forEach(ship => {
                const position = ship.lastpos.geometry.coordinates;
                const id = ship._id;
                const marker = new google.maps.Marker({
                    map: this.map,
                    position: {
                        lat: position[1],
                        lng: position[0]
                    },
                    title: id
                });
                marker.addListener('click', () => this.editShip(ship, marker));
                ship.marker = marker;
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

        this.altScreenMode = MODE_EDITING;
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
        this.altScreenMode = MODE_IDLE;
        this.loadingShipDetails = '';
        this.shipDetails = null;
        this.editingShip = null;
    }

    restoreView() {
        const { zoom, position } = this.previousDetails;
        this.map.setZoom(zoom);
        this.map.panTo(position);
    }

    cancelFilter() {
        this.altScreenMode = MODE_IDLE;
        this.filterMessage = null;
        this.restoreView();
    }

    filterByQuery() {
        this.previousDetails = {
            zoom: this.map.getZoom(),
            position: this.map.getCenter()
        };
        this.altScreenMode = MODE_QUERY;
    }

    resetMarkers() {
        this.ships.forEach(ship => {
            ship.marker.setLabel('');
        });
        this.filterMessage = 'Cleared all marked ships';
    }

    queryGrid() {
        const grid = {
            from: [28, 40],
            to: [30, 42]
        };
        this.service.queryGrid(grid).then(response => {
            const ships = response.data;
            const ids = _.map(ships, ship => ship._id);
            const wantedShips = _.filter(this.ships, ship => {
                return _.includes(ids, ship._id);
            });
            if (wantedShips.length > 0 ) {
                wantedShips.forEach(ship => {
                    ship.marker.setLabel('S');
                });
                this.map.setZoom(MARKER_ZOOM);
                this.map.panTo(wantedShips[0].marker.getPosition());
            }
            this.filterMessage = `Found ${wantedShips.length} suspicious ships`;
        });
    }

    queryBiggestShip() {
        this.service.getBiggestShip().then(response => {
            const ship = response.data;
            const localShip = _.find(this.ships, { _id: ship._id });
            localShip.marker.setLabel('S');
            this.map.setZoom(MARKER_ZOOM);
            this.map.panTo(localShip.marker.getPosition());
            this.filterMessage = `Zooming in on biggest ship`;
        });
    }
}
