import angular from 'angular';
import uirouter from 'angular-ui-router';
import 'lodash';

import routing from './app.config';
import home from './features/home';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAS9_T5fcEZLu3cyXPnQmj1qTmj2TnvwtM';

angular.module('windward', [uirouter, home])
    .config(routing);
