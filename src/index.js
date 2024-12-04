import React from 'react';
import { cloneElement } from 'react';
import ReactDOM from 'react-dom/client';
import { useState } from 'react';
import './index.css';
import L from 'leaflet'
import { ZAU_Hi, ZAU_Lo } from './ZAU_Sectors.js'
import { ZAU_Hi_Borders, ZAU_Lo_Borders, PMM_Border } from './ZAU_borders.js';


// DEFINE ZAU POSITIONS
// A Position controls one or many Sectors
const ZAUPositions = []

ZAUPositions.getPositionByID = function (i) {

  let position = BEARZ;
  this.forEach(pos => { if (pos.id == i) { position = pos } })
  return position

}

class Position {
  constructor(pos_id, pos_phonetic, pos_name, freq, color, active) {
    this.id = pos_id;
    this.phonetic = pos_phonetic;
    this.name = pos_name;
    this.freq = freq;
    this.color = color;
    this.active = active;
    this.label_hi = L.marker([42, -89], {
      icon: L.divIcon({
        iconSize: null,
        className: "pos_label",
        html: this.name + " <br> " + this.id
      })
    });
    this.label_lo = L.marker([42, -89], {
      icon: L.divIcon({
        iconSize: null,
        className: "pos_label",
        html: this.name + " <br> " + this.id
      })
    });
    this.ownedHi = new Set();
    this.ownedLo = new Set();
    ZAUPositions.push(this);
  }

}

const BEARZ = new Position("35", "BEARZ", "BEARZ", "134.875", "#ff7f27", true)
const COTON = new Position("75", "COTON", "COTON", "127.775", "#fbc98e", false)
const BVT = new Position("46", "BOILER", "BVT", "121.275", "#a4d5ee", false)
const BAE = new Position("60", "BADGER", "BAE", "126.875", "#f26d7d", false)
const GIJ = new Position("89", "GIPPER", "GIJ", "126.475", "#41b6e6", false)
const PMM = new Position("25", "PULLMAN", "PMM", "126.125", "#4aa564", false)
const IOW = new Position("94", "IOWA CITY", "IOW", "125.575", "#2e8540", false)
const BDF = new Position("52", "BRADFORD", "BDF", "132.225", "#f5989d", false)
const EON = new Position("44", "PEOTONE", "EON", "120.125", "#9999ff", false)
const PLANO = new Position("51", "PLANO", "PLANO", "135.150", "#cccc00", false)
const LNR = new Position("64", "LONE ROCK", "LNR", "133.300", "#7fd2a8", false)
const KUBBS = new Position("26", "KUBBS", "KUBBS", "133.200", "#5674b9", false)
const BRL = new Position("55", "BURLINGTON", "BRL", "118.750", "#7accc8", false)
const DBQ = new Position("63", "DUBUQUE", "DBQ", "133.950", "#f26d7d", false)
const FWA = new Position("36", "FORT WAYNE", "FWA", "126.325", "#f06eaa", false)
const FARMM = new Position("74", "FARMM", "FARMM", "133.350", "#f9ad81", false)
const MALTA = new Position("77", "MALTA", "MALTA", "134.825", "#f06eaa", false)
const HARLY = new Position("62", "HARLY", "HARLY", "123.825", "#fbaf5d", false)
const CRIBB = new Position("81", "CRIBB", "CRIBB", "120.350", "#c2c2c2", false)


const defaultPosition = BEARZ
var armedPosition = defaultPosition
const iowCorridor_label = L.marker([42.142026, -90.919368])
const bdfSplit_label = L.marker([41.1, -90.4])
const bvtCorridor_label = L.marker([41.375229, -88.283288])
const eonLOW_label = L.marker([41.120992, -88.302134])
const pmm_label = L.marker([42.77505, -86.045098])
const kubbs_label = L.marker([42.77505, -86.045098])
const pmm_line = L.geoJSON(PMM_Border, { style: drawBorders })
const kubbs_line = L.geoJSON(PMM_Border, { style: drawBorders })



initialAssignDefault(); // on load, assigns all positions to BEARZ

// INITIALIZE MAP
const map_hi = L.map('map_hi', {
  zoomSnap: 0.1,
  zoomControl: false,
  doubleClickZoom: false,
  scrollWheelZoom: false,
  touchZoom: false,
  dragging: false

}).setView([42, -89], 6.7);

const map_lo = L.map('map_lo', {
  zoomSnap: 0.1,
  zoomControl: false,
  doubleClickZoom: false,
  scrollWheelZoom: false,
  touchZoom: false,
  dragging: false
}).setView([42, -89], 6.7);

// Generic map. If this segment is commented out, a blank white BG will be used

/*L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map_hi);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map_lo);
*/



// CREATE SECTORS AS GEOJSON OBJECTS AND DEFINE METHODS
const geojson_hi = L.geoJSON(ZAU_Hi, {
  style:
    initDrawMap,
  onEachFeature
}).addTo(map_hi);

const geojson_lo = L.geoJSON(ZAU_Lo, {
  style:
    initDrawMap,
  onEachFeature
}).addTo(map_lo);


geojson_hi.getLayerbyName = function (name) {
  for (var i in this._layers) {
    if (this._layers[i].feature.properties.name == name)
      return this._layers[i];
  }
}

geojson_hi.getLayerbyID = function (id) {
  for (var i in this._layers) {
    if (this._layers[i].feature.properties.id == id)
      return this._layers[i];
  }
}


geojson_lo.getLayerbyName = function (name) {
  for (var i in this._layers) {
    if (this._layers[i].feature.properties.name == name)
      return this._layers[i];
  }
}

geojson_lo.getLayerbyID = function (id) {
  for (var i in this._layers) {
    if (this._layers[i].feature.properties.id == id)
      return this._layers[i];
  }
}

function getOwner(sector) { //input a sector layer, return its owner object 
  let id = sector.feature.properties.id
  let level = sector.feature.properties.level // hi or lo
  let ActivePositions = ZAUPositions.filter(p => p.active)
  let owner = 0

  switch (level) {
    case "hi": ActivePositions.forEach(position => { if (position.ownedHi.has(id)) { owner = position } })
      break;
    case "lo": ActivePositions.forEach(position => { if (position.ownedLo.has(id)) { owner = position } })
      break;
  }
  return owner

}


// DRAW THE INITIAL LABEL AFTER DRAWING THE MAP

drawLabel(defaultPosition)



//debug get coords
//map_hi.on('click', onMapClick)
//map_lo.on('click', onMapClick)

function onMapClick(e) {
  console.log("You clicked the map at " + e.latlng.toString())
}

//For debugging 
/*
console.log(geojson_hi);
console.log(geojson_lo);
*/

// MAIN FUNCTIONS FOR ASSIGNING SECTORS

function clickSector(p) {  // what to do if a sector is clicked

  const layer = p.target

  if (layer.feature.properties.special) { return } // calculated layer sectors not selectable

  assignSectorTo(layer, armedPosition); //assigns clicked sector to the armed position
  refreshMaps();

}

function assignSectorTo(sector, newOwner) { //assigns sector to position

  const oldOwner = getOwner(sector) // the INITIAL owner of the sector
  const id = sector.feature.properties.id

  if (newOwner == oldOwner) { return } //if current owner = input position, do nothing

  switch (sector.feature.properties.level) {   //determine if sector is high or low
    case "hi":
      oldOwner.ownedHi.delete(id)   //remove sector from current owner's sector set
      newOwner.ownedHi.add(id)     //add sector to new owner's sector set
      break;
    case "lo":
      oldOwner.ownedLo.delete(id)
      newOwner.ownedLo.add(id)
      break;
  }

  //open the new sector if not opened
  if (newOwner.ownedHi.size + newOwner.ownedLo.size > 0) { newOwner.active = true }

}

function refreshMaps() { //update the maps (colors, labels) after any sector is assigned a new owner
  
  // iterate through each active position
  const ActivePositions = ZAUPositions.filter(p => p.active) 

  ActivePositions.forEach(pos => {
    drawLabel(pos)
    colorMap(pos)
  })

  //check the rules for special sectors
  checkSpecialSectors();

}



function drawLabel(position) { 
  //each sector has a defined label anchor; draws position label on the first sector clicked

  //draw label on high map
  if (position.ownedHi.size > 0) {
    const x = position.ownedHi.values().next().value
    const hiLabelPos = geojson_hi.getLayerbyID(x).feature.properties.labelAnchor
    position.label_hi.setLatLng(hiLabelPos).addTo(map_hi);
  } else { position.label_hi.remove() } //if the position owns no sectors on the map, remove it

  //draw label on lo map
  if (position.ownedLo.size > 0) {
    const y = position.ownedLo.values().next().value
    const loLabelPos = geojson_lo.getLayerbyID(y).feature.properties.labelAnchor
    position.label_lo.setLatLng(loLabelPos).addTo(map_lo);
  } else { position.label_lo.remove() } //if the position owns no sectors on the map, remove it

}

function colorMap(position) { //given a position, colors each sector this position owns

  position.ownedHi.forEach(id => {
    geojson_hi.getLayerbyID(id).setStyle({ fillColor: position.color })
  })

  position.ownedLo.forEach(id => {
    geojson_lo.getLayerbyID(id).setStyle({ fillColor: position.color })
  })
}





function averageColors(colorA, colorB) { //given two hex colors, finds the average color
  const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
  const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
  const r = Math.round((rA + rB) * 0.5).toString(16).padStart(2, '0');
  const g = Math.round((gA + gB) * 0.5).toString(16).padStart(2, '0');
  const b = Math.round((bA + bB) * 0.5).toString(16).padStart(2, '0');
  return '#' + r + g + b;
}





function checkSpecialSectors() {

  const iowCorridor = geojson_hi.getLayerbyName("IOW Corridor")
  const bvtCorridor = geojson_hi.getLayerbyName("BOILER CLIMB CORRIDOR")
  const eonLow = geojson_lo.getLayerbyName("LOW EON")
  const layerCOTON = geojson_hi.getLayerbyName("COTON")
  const layerIOW = geojson_hi.getLayerbyName("IOWA CITY")
  const layerBDF = geojson_hi.getLayerbyName("BRADFORD")
  const layerBVT = geojson_hi.getLayerbyName("BOILER")
  const layerGIJ = geojson_hi.getLayerbyName("GIPPER")
  const layerEON = geojson_lo.getLayerbyName("PEOTONE")
  const layerPLANO = geojson_lo.getLayerbyName("PLANO")
  const layerPMM = geojson_hi.getLayerbyName("PULLMAN")
  const layerKUBBS = geojson_lo.getLayerbyName("KUBBS")


  //since sector ownership is stored on the position side, 
  //we compare fill color to determine if two sectors have the same owner
  //this saves some processing power vs using getOwner over and over again

  //IOW Corridor (COTON owns 330+, IOW 240-320)
  if (layerCOTON.options.fillColor == layerIOW.options.fillColor) {
    iowCorridor.setStyle({ fillColor: layerCOTON.options.fillColor })
    iowCorridor_label.remove()

  } else {
    iowCorridor.setStyle({ fillColor: averageColors(layerCOTON.options.fillColor, layerIOW.options.fillColor) })
    const iow_Txt = L.divIcon({
      iconSize: null,
      className: "spec-label",
      html: getOwner(layerIOW).name + " FL240 - FL290   " + getOwner(layerCOTON).name + " FL330+"
    })
    iowCorridor_label.setIcon(iow_Txt).addTo(map_hi)
  }


  //Bradford (BDF 240-320, IOW 340+)
  if (layerBDF.options.fillColor == layerIOW.options.fillColor) {
    layerBDF.setStyle({ fillColor: layerIOW.options.fillColor })
    bdfSplit_label.remove()
  } else {
    layerBDF.setStyle({ fillColor: averageColors(layerIOW.options.fillColor, getOwner(layerBDF).color) })
    const bdf_Txt = L.divIcon({
      iconSize: null,
      className: "spec-label",
      html: getOwner(layerBDF).name + " FL240 - FL330 <br>" + getOwner(layerIOW).name + " FL340+"
    })
    bdfSplit_label.setIcon(bdf_Txt).addTo(map_hi)
  }

  //Boiler Climb Corridor (Boiler FL240-360)

  if (layerBVT.options.fillColor == layerGIJ.options.fillColor) {
    bvtCorridor.setStyle({ fillColor: layerGIJ.options.fillColor })
    bvtCorridor_label.remove()
  } else {
    bvtCorridor.setStyle({ fillColor: averageColors(layerBVT.options.fillColor, layerGIJ.options.fillColor) })
    const bvt_Txt = L.divIcon({
      iconSize: null,
      className: "spec-label",
      html: getOwner(layerBVT).name + " <br> FL240 - FL290"
    })
    bvtCorridor_label.setIcon(bvt_Txt).addTo(map_hi)
  }

  //Peotone (Plano SFC - 100)
  if (layerEON.options.fillColor == layerPLANO.options.fillColor) {
    eonLow.setStyle({ fillColor: layerEON.options.fillColor })
    eonLOW_label.remove()
  } else {
    eonLow.setStyle({ fillColor: averageColors(layerEON.options.fillColor, layerPLANO.options.fillColor) })
    const eon_Txt = L.divIcon({
      iconSize: null,
      className: "spec-label",
      html: getOwner(layerEON).name + " 110 - FL230 <br>" + getOwner(layerPLANO).name + " SFC - 100"
    })
    eonLOW_label.setIcon(eon_Txt).addTo(map_lo)
  }

  // PMM and KUBBS (right side PMM 200+)

  if (layerPMM.options.fillColor == layerKUBBS.options.fillColor) {
    pmm_label.remove()
    kubbs_label.remove()
    pmm_line.remove()
    kubbs_line.remove()
  } else {

    pmm_line.addTo(map_hi);

    const pmm_Txt = L.divIcon({
      iconSize: null,
      className: "spec-label",
      html: getOwner(layerPMM).name + " FL200+"
    })

    pmm_label.setIcon(pmm_Txt).addTo(map_hi)

    kubbs_line.addTo(map_lo);

    const kubbs_Txt = L.divIcon({
      iconSize: null,
      className: "spec-label",
      html: getOwner(layerKUBBS).name + "<br> SFC - FL190"
    })

    kubbs_label.setIcon(kubbs_Txt).addTo(map_lo)

  }
}

function initialAssignDefault() { //This function assigns all Sectors to Default Position
  ZAU_Hi.features.forEach(sector => {
    if (!sector.properties.special) { //do not assign special sectors
      defaultPosition.ownedHi.add(sector.properties.id)
    }
  })

  ZAU_Lo.features.forEach(sector => {
    if (!sector.properties.special) { //do not assign special sectors
      defaultPosition.ownedLo.add(sector.properties.id)
    }
  })

}



// global statesData


function onEachFeature(feature, layer) {
  layer.on({
    click: clickSector
  });
}


// draw borders

L.geoJSON(ZAU_Hi_Borders, { style: drawBorders }
).addTo(map_hi);

L.geoJSON(ZAU_Lo_Borders, { style: drawBorders }
).addTo(map_lo);



function initDrawMap(a) {
  return {
    color: '#3f3f3f',
    fillColor: '#ff7f27',
    opacity: 1,
    fillOpacity: 1,
  };
}

function drawBorders(b) {
  switch (b.properties.borderType) {
    case 'ZAU': return {
      color: '#e4002b',
      weight: 5
    };
    case 'Neighbor': return {
      color: '#000000',
      weight: 2
    };
    case 'InteriorBoundry': return {
      color: '#3f3f3f',
      dashArray: 8,
      dashOffset: 8,
      opacity: 0.8
    }
  }
}

function closePosition(positionClosing, targetPosition = defaultPosition) {
  positionClosing.ownedHi.forEach((sector) => {
    targetPosition.ownedHi.add(sector);
    positionClosing.ownedHi.delete(sector);
  })

  positionClosing.ownedLo.forEach((sector) => {
    targetPosition.ownedLo.add(sector);
    positionClosing.ownedLo.delete(sector);
  })

  positionClosing.label_hi.remove()
  positionClosing.label_lo.remove()

  positionClosing.active = false
  armPosition(targetPosition) //important! Cannot arm a closed position!

  refreshMaps()
}


function armPosition(p) {
  armedPosition = p
}



// USER INTERFACE

function App() {
  const [openPos, setOpenPos] = useState(ZAUPositions.filter((position) => position.active))

  //Add new position dropdown
  const [open, setOpen] = useState(false)
  const handleOpen = () => { setOpen(!open) }

  const handleNewPosition = (x) => { //whenever a new option is selected from a dropdown
    const selectedPosition = ZAUPositions.getPositionByID(x) //find position from ID
    armPosition(selectedPosition)
    selectedPosition.active = true //opens the position
    setOpenPos(ZAUPositions.filter((position) => position.active))
    setOpen(false) //close the menu
  }




  const handleClosePosition = (pos, b) => { //whenever an option is selected from close position dropdown
    //pos (the position to close) is already passed as a position object   
    const positionToCombine = ZAUPositions.getPositionByID(b) //find both positions from ID
    closePosition(pos, positionToCombine) //closes the position
    setOpenPos(ZAUPositions.filter((position) => position.active))
  }



  //select (arm) position

  const handleSelectPosition = (x) => {
    const selectedPostion = ZAUPositions.getPositionByID(x) //find position from ID
    armPosition(selectedPostion)
  }

  const Dropdown = ({ open, trigger, items }) => {

    return (
      <div className="dropdown">
        {trigger}
        {open ? (
          <ul className="menu">
            {items.map((position) => (
              <li key={position.id} className="menu-item">
                <button onClick={() => handleNewPosition(position.id)}>{position.name} - {position.id}</button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }


  const Dropdown2 = ({ trigger, items, thisPosition }) => { //dropdown for CLOSE POSITIONS

    const [open, setOpen] = useState(false)
    const handleOpen = () => { setOpen(!open) }
    if (ZAUPositions.filter(p => p.active).length <= 1) { return }

    return (
      <div className="dropdown">
        {cloneElement(trigger, {
          onClick: handleOpen
        })}
        {open ? (
          <ul className="menu">
            {items.map((position) => (
              <li key={position.id} className="menu-item">
                <button onClick={() => handleClosePosition(thisPosition, position.id)}>{position.name} - {position.id}</button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className="positionList">
        <ul className="positions">
          {openPos.map((position) =>
            <li>
              <button onClick={() => handleSelectPosition(position.id)}>{position.name + " " + position.id + " " + position.freq}</button>

              <Dropdown2
                trigger={<button>Close Position</button>}
                items={ZAUPositions.filter((p) => (p.active && p != position))} // pass all ACTIVE positions
                thisPosition={position}
              />
            </li>
          )
          }
          <li><Dropdown
            open={open}
            trigger={<button id="newPositionButton" onClick={handleOpen}>Open New Position</button>}
            items={ZAUPositions.filter((position) => !position.active)} //pass all INACTIVE positions
          /></li>
        </ul>
      </div>


    </>
  );


}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
//
