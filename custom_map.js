looker.plugins.visualizations.add({
  id: "custom_map",
  label: "Custom Map with Multiple Measures",
  options: {
    measure_colors: {
      type: "array",
      label: "Measure Colors",
      display: "colors",
      default: ["#f00", "#0f0", "#00f"],
    },
  },
  create: function (element, config) {
    element.innerHTML = "<div id='map'></div>";
    var css = `
      #map {
        width: 100%;
        height: 100%;
      }
    `;
    var style = document.createElement("style");
    style.type = "text/css";
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);

    // Initialize Leaflet.js map
    this.map = L.map('map').setView([37.8, -96], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  },
  update: function (data, element, config, queryResponse) {
    var mapElement = document.getElementById("map");

    if (!mapElement) {
      this.create(element, config);
      mapElement = document.getElementById("map");
    }

    // Clear previous layers
    if (this.layerGroup) {
      this.layerGroup.clearLayers();
    } else {
      this.layerGroup = L.layerGroup().addTo(this.map);
    }

    // Prepare map data
    var locations = data.map(function (row) {
      return {
        location: row[queryResponse.fields.dimension_like[0].name].value,
        measures: queryResponse.fields.measure_like.map(measure => ({
          name: measure.name,
          value: row[measure.name].value,
        })),
      };
    });

    // Define color scales for measures
    var measureColors = config.measure_colors;

    locations.forEach(function (loc) {
      var totalValue = loc.measures.reduce((sum, measure) => sum + measure.value, 0);
      var marker = L.circleMarker([loc.location.lat, loc.location.lng], {
        color: measureColors[0],
        fillColor: measureColors[1],
        fillOpacity: 0.5,
        radius: Math.sqrt(totalValue) * 2
      }).addTo(this.layerGroup);

      var popupContent = `<b>Location:</b> ${loc.location}<br>`;
      loc.measures.forEach((measure, index) => {
        popupContent += `<b>Measure ${index + 1}:</b> ${measure.value}<br>`;
      });
      marker.bindPopup(popupContent);
    }, this);
  }
});
