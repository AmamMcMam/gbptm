import L from 'leaflet';
import { MapControl, withLeaflet } from 'react-leaflet';
// Import source file instead of by module name to avoid Webpack warning
// https://github.com/perliedman/leaflet-control-geocoder/issues/150
import 'leaflet-control-geocoder/src';

class GeolocationMapControl extends MapControl {
  createLeafletElement() {
    var control = L.Control.geocoder({
      // eslint-disable-next-line new-cap
      geocoder: new L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
          // Experimental and currently not working
          // http://wiki.openstreetmap.org/wiki/Nominatim#Parameters
          countrycodes: 'gb',
        },
      }),
      collapsed: true,
      placeholder: 'Placename or postcode...',
    });

    control.markGeocode = function(result) {
      this._map.setView(result.geocode.center);

      return this;
    };

    return control;
  }
}

export default withLeaflet(GeolocationMapControl);
