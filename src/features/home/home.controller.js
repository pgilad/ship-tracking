export default function HomeController($scope, ShipsService) {
    // setup map
    var initialCenterCords = {
        lat: -25.363,
        lng: 131.044
    };

    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(document.getElementById('map'), {
        center: initialCenterCords,
        scrollwheel: true,
        zoom: 2
    });

    this.editShip = (ship, marker) => {
        map.setZoom(4);
        map.setCenter(marker.getPosition());
        this.isEditingShip = true;
        this.editingShip = ship;
        $scope.$apply();
        google.maps.event.trigger(map, "resize");
    };

    ShipsService.fetchLocations().then(locations => {
        const ships = locations.data;
        ships.forEach(ship => {
            const position = ship.lastpos.geometry.coordinates;
            const id = ship._id;
            // Create a marker and set its position.
            var marker = new google.maps.Marker({
                map: map,
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
