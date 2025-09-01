import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useSelector, useDispatch } from "react-redux";
import {
  selectPointsFC,
  selectSelectedId,
  selectEntities,
  setSelected,
} from "../../store/dronesSlice";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapView() {
  const dispatch = useDispatch();

  const points = useSelector(selectPointsFC);
  const selectedId = useSelector(selectSelectedId);
  const entities = useSelector(selectEntities);

  const mapRef = useRef(null);

  
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: "map-canvas",
      style: "mapbox://styles/mapbox/dark-v11",
      center: [35.93, 31.95],
      zoom: 12,
    });
    mapRef.current = map;

    map.on("load", () => {
    
      map.addSource("drones", { type: "geojson", data: { type:"FeatureCollection", features: [] } });
      map.addSource("selected-path", { type: "geojson", data: { type: "FeatureCollection", features: [] } });

 
      const loadIcon = (name, url) => {
        map.loadImage(url, (err, img) => {
          if (err || !img) return;
          if (!map.hasImage(name)) map.addImage(name, img);
        });
      };
      loadIcon("drone-green", "/icons/drone-green.png");
      loadIcon("drone-red", "/icons/drone-red.png");

   
      map.addLayer({
        id: "drones-layer",
        type: "symbol",
        source: "drones",
        layout: {
          "icon-image": [
            "case",
            ["==", ["get", "allowed"], 1],
            "drone-green",
            "drone-red",
          ],
          "icon-size": 0.7,
          "icon-rotate": ["get", "yaw"],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
        },
      });

    
      map.addLayer({
        id: "selected-path-layer",
        type: "line",
        source: "selected-path",
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "allowed"], 1],
            "#22c55e",
            "#ef4444",
          ],
          "line-width": 4,
        },
      });

  
      map.addLayer({
        id: "drone-highlight",
        type: "circle",
        source: "drones",
        paint: {
          "circle-color": "rgba(255,255,255,0.25)",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
          "circle-radius": 20,
        },
        filter: ["==", ["get", "id"], "___none___"],
      });

     
      map.on("click", "drones-layer", (e) => {
        const f = e.features?.[0];
        if (f) dispatch(setSelected(f.properties.id));
      });
    });
  }, [dispatch]);

 
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("drones");
    if (src) src.setData(points);
  }, [points]);


  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (!selectedId) {
      map.getSource("selected-path")?.setData({ type:"FeatureCollection", features: [] });
      map.setFilter("drone-highlight", ["==", ["get", "id"], "___none___"]);
      return;
    }

    const d = entities[selectedId];
    if (d && d.path && d.path.length > 1) {
   
      map.getSource("selected-path")?.setData({
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: { type: "LineString", coordinates: d.path },
          properties: { allowed: d.allowed ? 1 : 0 },
        }]
      });

      map.setFilter("drone-highlight", ["==", ["get", "id"], selectedId]);

  
      const bounds = new mapboxgl.LngLatBounds();
      d.path.forEach(coord => bounds.extend(coord));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, duration: 1000 });
      }
    }
  }, [selectedId, entities]);

  return <div id="map-canvas" style={{ width: "100%", height: "100%" }} />;
}
