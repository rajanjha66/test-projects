// custom_map_viz.js

// Include Leaflet CSS and JS
const leafletCss = document.createElement("link");
leafletCss.rel = "stylesheet";
leafletCss.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";  // This is the link to Leaflet CSS
document.head.appendChild(leafletCss);

const leafletJs = document.createElement("script");
leafletJs.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";  // This is the link to Leaflet JavaScript
document.head.appendChild(leafletJs);

looker.plugins.visualizations.add({
  id: "custom_map",
  label: "Custom Map",
  options: {
    center_lat: {
      type: "number",
      label: "Center Latitude",
      default: 0
    },
    center_lng: {
      type: "number",
      label: "Center Longitude",
      default: 0
    },
    zoom: {
      type: "number",
      label: "Zoom Level",
      default: 2
    }
  },
  create: function(element, config) {
    // Set up the initial state of the visualization
    element.innerHTML = `
      <style>
        #map {
          width: 100%;
          height: 100%;
        }
      </style>
      <div id="map"></div>
    `;

    this.map = L.map(element.querySelector("#map")).setView([config.center_lat, config.center_lng], config.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  },
  update: function(data, element, config, queryResponse) {
    // Clear any existing markers
    this.map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    }.bind(this));

    // Validate the data format
    if (queryResponse.fields.dimensions.length < 2) {
      this.addError({title: "Invalid Data", message: "Map requires at least two dimensions: latitude and longitude."});
      return;
    }

    // Extract the data for latitude and longitude
    const latField = queryResponse.fields.dimensions.find(dim => dim.name.toLowerCase().includes("lat"));
    const lngField = queryResponse.fields.dimensions.find(dim => dim.name.toLowerCase().includes("lng"));

    if (!latField || !lngField) {
      this.addError({title: "Invalid Data", message: "Data must contain latitude and longitude dimensions."});
      return;
    }

    // Add markers for each data point
    data.forEach(row => {
      const lat = row[latField.name].value;
      const lng = row[lngField.name].value;
      const popupContent = queryResponse.fields.measures.map(measure => {
        return `<strong>${measure.label_short}:</strong> ${row[measure.name].value}`;
      }).join("<br>");

      L.marker([lat, lng]).addTo(this.map)
        .bindPopup(popupContent);
    });

    // Adjust map view to fit all markers
    const bounds = data.map(row => [row[latField.name].value, row[lngField.name].value]);
    if (bounds.length > 0) {
      this.map.fitBounds(bounds);
    }
  }
});
