import angular from 'angular';
import uirouter from 'angular-ui-router';

import './home.css';
import routing from './home.routes';
import HomeController from './home.controller';
import Ships from '../../services/ships';

export default angular.module('windward.home', [uirouter, Ships])
  .config(routing)
  .controller('HomeController', HomeController)
  .name;
