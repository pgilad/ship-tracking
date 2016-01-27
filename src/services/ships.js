import angular from 'angular';

function Locations($http) {
    let locations = [];
    let lastFetched = null;

    this.fetchLocations = (force = false) => {
        if (lastFetched && !force) {
          return locations;
        }
        lastFetched = Date.now();
        return $http.get('/api/locations');
    }
    this.getShipData = (id) => {
        return $http.get(`/api/ships/${id}`);
    }
}

export default angular.module('services.locations', [])
    .service('ShipsService', Locations)
    .name;
