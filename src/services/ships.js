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
    };

    this.getShipData = (id) => {
        return $http.get(`/api/ships/${id}`);
    };

    this.saveShip = (ship) => {
        return $http.put(`/api/ships/${ship._id}`, ship);
    };

    this.getBiggestShip = () => {
        return $http.get('/api/queries/biggest-ship');
    };

    this.queryGrid = (grid) => {
        return $http.post('/api/queries/grid', { grid });
    };
}

export default angular.module('services.locations', [])
    .service('ShipsService', Locations)
    .name;
