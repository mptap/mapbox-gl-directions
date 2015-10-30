import format from '../format';
import template from 'lodash.template';
import isEqual from 'lodash.isequal';

let fs = require('fs'); // substack/brfs#39
let tmpl = template(fs.readFileSync(__dirname + '/../templates/instructions.html', 'utf8'));

/**
 * Summary/Instructions controller
 *
 * @param {HTMLElement} el Summary parent container
 * @param {Object} store A redux store
 * @param {Object} actions Actions an element can dispatch
 * @param {Object} map The mapboxgl instance
 * @private
 */
export default class Instructions {
  constructor(el, store, actions, map) {
    this.container = el;
    this.actions = actions;
    this.map = map;
    this.directions = {};

    this.render(store);
  }

  render(store) {
    store.subscribe(() => {
      const { hoverMarker } = this.actions;
      const { routeIndex, unit, directions } = store.getState();

      if (directions.length && !isEqual(directions[routeIndex], this.directions)) {
        const direction = this.directions = directions[routeIndex];

        this.container.innerHTML = tmpl({
          routeIndex,
          steps: direction.steps,
          format: format[unit],
          duration: format[unit](direction.distance),
          distance: format.duration(direction.duration)
        });

        var steps = this.container.querySelectorAll('.mapbox-directions-step');

        Array.prototype.forEach.call(steps, (el) => {
          const lng = el.getAttribute('data-lng');
          const lat = el.getAttribute('data-lat');

          el.addEventListener('mouseover', () => {
            hoverMarker([lng, lat]);
          });

          el.addEventListener('mouseout', () => {
            hoverMarker(null);
          });

          el.addEventListener('click', () => {
            this.map.flyTo({ center: [lng, lat] });
          });
        });
      }
    });
  }
}