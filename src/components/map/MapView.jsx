import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useSelector, useDispatch } from "react-redux";
import {
  selectPointsFC,
  selectLinesFC,
  selectSelectedId,
  selectEntities,
  setSelected
} from "../../store/dronesSlice";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapView() {
  const dispatch = useDispatch();

  const points = useSelector(selectPointsFC);      
  const lines = useSelector(selectLinesFC);        
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

        map.addSource("drones", { type: "geojson", data: points });
      map.addSource("paths", { type: "geojson", data: lines });
      map.addSource("selected-path", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });

      map.addLayer({
        id: "paths-layer",
        type: "line",
        source: "paths",
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "allowed"], 1],
            "#22c55e",
            "#ef4444",
          ],
          "line-width": 2,
          "line-opacity": 0.5,
        },
      });

      const loadIcon = (name, url) => {
        map.loadImage(url, (err, img) => {
          if (!err && img && !map.hasImage(name)) {
            map.addImage(name, img);
          }
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
          "icon-size": 0.65,
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
          "circle-color": "rgba(255,255,255,0.2)",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-radius": 18,
        },
        filter: ["==", ["get", "id"], "___none___"],
      });

      map.on("click", "drones-layer", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        dispatch(setSelected(f.properties.id));
      });
    });
  }, [dispatch, points, lines]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getSource("drones")) map.getSource("drones").setData(points);
    if (map.getSource("paths")) map.getSource("paths").setData(lines);
  }, [points, lines]);

  
 useEffect(() => {
  const map = mapRef.current;
  if (!map) return;
  if (!map.isStyleLoaded()) return; 

  if (!selectedId) {
    if (map.getSource("selected-path")) {
      map.getSource("selected-path").setData({ type:"FeatureCollection", features: [] });
    }
    if (map.getLayer("drone-highlight")) {
      map.setFilter("drone-highlight", ["==", ["get", "id"], "___none___"]);
    }
    return;
  }

  const d = entities[selectedId];
  if (d && d.path && d.path.length > 1) {
    const fc = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: d.path },
          properties: { allowed: d.allowed ? 1 : 0 },
        }
      ]
    };
    map.getSource("selected-path")?.setData(fc);

    if (map.getLayer("drone-highlight")) {
      map.setFilter("drone-highlight", ["==", ["get", "id"], selectedId]);
    }

    const bounds = new mapboxgl.LngLatBounds();
    d.path.forEach((c) => bounds.extend(c));
    map.fitBounds(bounds, { padding: 80, duration: 1000 });
  }
}, [selectedId, entities]);

  return <div id="map-canvas" style={{ width: "100%", height: "100%" }} />;
}