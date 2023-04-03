const map = new ol.Map({
  target: "map",
  view: new ol.View({
    center: [3500000, 3500000],
    zoom: 4,
  }),
  layers: [],
});

// ==================================== we make 3 basemap layers ====================================

const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: true,
  layername: "osm",
});
const lightGrayMapLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}@2x.png?api_key=1c323ad5-74e3-4b80-b8bb-d337f1e29f05",
  }),
  visible: false,
  layername: "light_gray_alidade",
});
const darkMapLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png?api_key=1c323ad5-74e3-4b80-b8bb-d337f1e29f05",
  }),
  visible: false,
  layername: "dark_alidade",
});

// ==================================== we add the 3 layers to the map layers  ====================================

map.addLayer(osmLayer);
map.addLayer(lightGrayMapLayer);
map.addLayer(darkMapLayer);

// ==================================== Now let's select all the input radiochecks ====================================

const switchList = document.querySelectorAll("input");

// ==================================== we add the 3 layers to a group so that we can loop on them to switch between them  ====================================

const basemapGroup = new ol.layer.Group({
  layers: [osmLayer, darkMapLayer, lightGrayMapLayer],
});

// ==================================== let's loop on the input and add an event listener on each one of them and we use an arrow function to do that ====================================

switchList.forEach((element) => {
  element.addEventListener("change", (e) => {
    const basemapname = element.id;

    // ==================================== now we loop on the group of basemaps and use the getlayer function to be able to get the arraylist and loop on them   ====================================

    basemapGroup.getLayers().forEach((layer) => {
      if (layer.get("layername") === basemapname) {
        layer.setVisible(true);
      } else {
        layer.setVisible(false);
      }
    });
  });
});

// ==================================== DAY 2 vector layers - overlay and interactions   ====================================

const polygonStyle = new ol.style.Fill({
  color: "rgba(192, 188, 185, 0.69)",
});

const lineStyle = new ol.style.Stroke({
  color: "rgba(236, 19, 23, 0.63)",
  width: 1.5,
});

const pointStyle = new ol.style.Circle({
  radius: 8,
  fill: polygonStyle,
  stroke: lineStyle,
});

// ==================================== adding data from a server   ====================================

// const serverData = new ol.layer.Vector({
//   source: new ol.source.Vector({
//     format: new ol.format.GeoJSON(),
//     url: "https://geowebservices.stanford.edu/geoserver/wfs?request=getFeature&outputformat=application/json&typeName=druid:vn895fq9113",
//   }),
//   style: new ol.style.Style({
//     fill: polygonStyle,
//     stroke: lineStyle,
//   }),
// });

// map.addLayer(serverData);

// ==================================== let's add a measure interaction that lets the user draw and measure    ====================================

// ==================================== we add a vector layer to display on the map all the different interactions ====================================

const vectorType = new ol.layer.Vector({
  source: new ol.source.Vector({}),
});

// ==================================== we create function that handle point, lines and polygon geometries and get their dimension to display them for the user ====================================

function pointHandler(element) {
  pointMeasurmentHandler(
    Math.ceil(element.target.sketchCoords_[0]),
    Math.ceil(element.target.sketchCoords_[1])
  );
  popup.setPosition(element.target.sketchCoords_);
}
function lineHandler(element) {
  let line = element.feature.getGeometry();
  line.addEventListener("change", (e) => {
    lineMeasurmentHandler(line.getLength());
    popup.setPosition(line.getLastCoordinate());
  });
}
function polygonHandler(element) {
  let polygon = element.feature.getGeometry();
  polygon.addEventListener("change", (e) => {
    polygonMeasurmentHandler(polygon.getArea());
    popup.setPosition(polygon.getInteriorPoint().getCoordinates());
  });
}

// ==================================== we create a function that creates any layer that wants to be added as interaction to the map ====================================

// ==================================== we add event listeners so that we can measure the features on the map (1 for point and 1 for other geometry ====================================

// ==================================== we add the previous point, line and polygon handler function to be executed when the event takes place ====================================

function pointMeasurmentHandler(long, lat) {
  rectangularPopup.textContent =
    "(" + long + ")" + " Lon " + " , " + "(" + lat + ")" + " Lat ";
}

function lineMeasurmentHandler(length) {
  if (length > 1000) {
    rectangularPopup.textContent =
      "(" + Math.ceil(length / 1000) + ")" + " km ";
  } else {
    rectangularPopup.textContent = "(" + Math.ceil(length) + ")" + " m ";
  }
}

function polygonMeasurmentHandler(area) {
  rectangularPopup.textContent =
    "(" + Math.ceil(area / 1000000) + ")" + " km^2 ";
}

function createInteraction(type) {
  measureToBeCreated = new ol.interaction.Draw({
    type: type,
    source: vectorType.getSource(),
  });
  if (type === "Point") {
    measureToBeCreated.addEventListener("drawend", (ePoint) => {
      pointHandler(ePoint);
    });
  } else {
    measureToBeCreated.addEventListener("drawstart", (eGeom) => {
      if (type === "LineString") {
        lineHandler(eGeom);
      } else {
        polygonHandler(eGeom);
      }
    });
  }
  return measureToBeCreated;
}

// ==================================== we make 2 global flages for measuring and for editting and 1 global variable that changes as we change our layer type selection ====================================

let measureToBeCreated;

let drawingInteraction;
const measureType = document.getElementById("measure_choice");
let isMeasureFlag = false;
let isEditFlag = false;

// ==================================== we add an event listener on the measure button so that it switches on and off to allow drawing and measuring or shut it off ====================================

const measureBtn = document.querySelector(".measure");
measureBtn.addEventListener("click", (e) => {
  if (!isMeasureFlag) {
    drawingInteraction = createInteraction(measureType.value);
    map.addInteraction(drawingInteraction);
    measureBtn.style.background = "rgba(51, 204, 51,0.5)";
    isMeasureFlag = true;
    map.addOverlay(popup);
  } else {
    map.removeInteraction(drawingInteraction);
    measureBtn.style.background = "rgba(255, 75, 84, 0.562)";
    isMeasureFlag = false;
    map.removeOverlay(popup);
  }
});

// ==================================== we add an event listener on the edit button so that it switches on and off to allow editting or shut it off ====================================

const modify = new ol.interaction.Modify({
  source: vectorType.getSource(),
});

const editBtn = document.querySelector(".edit");
editBtn.addEventListener("click", (e) => {
  if (!isEditFlag) {
    map.addInteraction(modify);
    editBtn.style.background = "rgba(51, 204, 51,0.5)";
    isEditFlag = true;
  } else {
    map.removeInteraction(modify);
    editBtn.style.background = "rgba(255, 75, 84, 0.562)";
    isEditFlag = false;
  }
});

// ==================================== we add an event listener on the drop-down list so that we can change the features drawn on the map ====================================

measureType.addEventListener("change", (e) => {
  if (isMeasureFlag) {
    map.removeInteraction(drawingInteraction);
    drawingInteraction = createInteraction(measureType.value);
    map.addInteraction(drawingInteraction);
  }
});

// ==================================== we add an event the vector layer so that it appears on the map ====================================

map.addLayer(vectorType);

// ==================================== now we want to add a popup that shows the coordinates for points, length for lines and area for polygons ====================================\

// ==================================== so we add an overlay to the map ====================================

const rectangularPopup = document.getElementById("popup");

const popup = new ol.Overlay({
  element: rectangularPopup,
  offset: [10, 10],
});

// map.addOverlay(popup);
