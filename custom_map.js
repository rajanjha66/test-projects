// Define the visualization object
looker.plugins.visualizations.add({
  id: "custom_map",
  label: "Custom Map with Multiple Measures",
  options: {
    color_range: {
      type: "array",
      label: "Color Range",
      default: ["#f00", "#0f0", "#00f"],
    },
    measure_one_color: {
      type: "string",
      label: "Measure One Color",
      default: "#f00",
    },
    measure_two_color: {
      type: "string",
      label: "Measure Two Color",
      default: "#0f0",
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
  },
  update: function (data, element, config, queryResponse) {
    var mapElement = document.getElementById("map");

    if (!mapElement) {
      this.create(element, config);
      mapElement = document.getElementById("map");
    }

    // Clear previous map if any
    while (mapElement.firstChild) {
      mapElement.removeChild(mapElement.firstChild);
    }

    // Prepare map data
    var locations = data.map(function (row) {
      return {
        location: row[queryResponse.fields.dimension_like[0].name].value,
        measure_one: row[queryResponse.fields.measure_like[0].name].value,
        measure_two: row[queryResponse.fields.measure_like[1].name].value,
      };
    });

    // Initialize the map (using Leaflet.js as an example)
    var map = L.map(mapElement).setView([37.8, -96], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Define color scales for measures
    var measureOneColor = config.measure_one_color;
    var measureTwoColor = config.measure_two_color;

    locations.forEach(function (loc) {
      var marker = L.circleMarker([loc.location.lat, loc.location.lng], {
        color: measureOneColor,
        fillColor: measureTwoColor,
        fillOpacity: 0.5,
        radius: Math.sqrt(loc.measure_one + loc.measure_two) * 2
      }).addTo(map);
      
      marker.bindPopup("<b>Location:</b> " + loc.location.name + "<br><b>Measure One:</b> " + loc.measure_one + "<br><b>Measure Two:</b> " + loc.measure_two);
    });
  }
});
