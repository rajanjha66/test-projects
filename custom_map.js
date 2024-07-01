looker.plugins.visualizations.add({
  id: "heat-density-map",
  label: "Heat Density Map",
  options: {
    color1: {
      type: "string",
      label: "Measure 1 Color",
      display: "color",
      default: "#ff0000"
    },
    color2: {
      type: "string",
      label: "Measure 2 Color",
      display: "color",
      default: "#0000ff"
    }
  },
  create: function(element, config) {
    element.innerHTML = `
      <style>
        #map { height: 100%; }
      </style>
      <div id="map"></div>
    `;

    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
    document.head.appendChild(leafletCss);

    const leafletScript = document.createElement("script");
    leafletScript.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
    leafletScript.onload = () => {
      this.map = L.map(element.querySelector("#map")).setView([0, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(this.map);

      this.heatLayer1 = L.heatLayer([], { radius: 25, blur: 15, maxZoom: 17, gradient: { 0.4: config.color1 } });
      this.heatLayer2 = L.heatLayer([], { radius: 25, blur: 15, maxZoom: 17, gradient: { 0.4: config.color2 } });

      this.map.addLayer(this.heatLayer1);
      this.map.addLayer(this.heatLayer2);
    };
    document.head.appendChild(leafletScript);
  },
  updateAsync: function(data, element, config, queryResponse, details, done) {
    if (!this.map) return;

    const locationField = queryResponse.fields.dimension_like[0].name;
    const measure1 = queryResponse.fields.measure_like[0].name;
    const measure2 = queryResponse.fields.measure_like[1].name;

    const heatData1 = data.map(row => [row[locationField].value[0], row[locationField].value[1], row[measure1].value]);
    const heatData2 = data.map(row => [row[locationField].value[0], row[locationField].value[1], row[measure2].value]);

    this.heatLayer1.setLatLngs(heatData1);
    this.heatLayer2.setLatLngs(heatData2);

    done();
  }
});
