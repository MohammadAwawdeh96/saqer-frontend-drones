import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  entities: {},
  order: [],
  selectedId: null,
  hoveredId: null,
  lastUpdate: null,
};

function isAllowed(reg) {

  const part = (reg || '').split('-')[1] || '';
  return part.startsWith('B');
}

const dronesSlice = createSlice({
  name: 'drones',
  initialState,
  reducers: {
    upsertFromFeatureCollection(state, action) {
      const fc = action.payload;
      if (!fc || !fc.features) return;
      const now = Date.now();

      for (const f of fc.features) {
        const p = f.properties || {};
        const id = p.serial;
        const coord = f.geometry?.coordinates;
        if (!id || !Array.isArray(coord)) continue;

        const allowed = isAllowed(p.registration);
        const prev = state.entities[id];

        if (!prev) {
          state.entities[id] = {
            id,
            serial: p.serial,
            registration: p.registration,
            name: p.Name || 'Drone',
            pilot: p.pilot || '',
            organization: p.organization || '',
            altitude: Number(p.altitude) || 0,
            yaw: Number(p.yaw) || 0,
            coord,
            allowed,
            firstSeen: now,
            lastSeen: now,
            path: [coord],
          };
          state.order.push(id);
        } else {
          const path = prev.path;
          const last = path[path.length - 1];
          if (!last || last[0] !== coord[0] || last[1] !== coord[1]) {
            path.push(coord);
          }
          state.entities[id] = {
            ...prev,
            registration: p.registration ?? prev.registration,
            altitude: Number(p.altitude) || 0,
            yaw: Number(p.yaw) || 0,
            coord,
            allowed,
            lastSeen: now,
            path,
          };
        }
      }
      state.lastUpdate = now;
    },
    setSelected(state, action) { state.selectedId = action.payload; },
    setHovered(state, action) { state.hoveredId = action.payload; },
  },
});

export const { upsertFromFeatureCollection, setSelected, setHovered } = dronesSlice.actions;
export default dronesSlice.reducer;

// Selectors
const selectSlice = (s) => s.drones;

export const selectOrder = (s) => selectSlice(s).order;
export const selectEntities = (s) => selectSlice(s).entities;
export const selectSelectedId = (s) => selectSlice(s).selectedId;
export const selectHoveredId = (s) => selectSlice(s).hoveredId;

export const selectAllDrones = createSelector(
  [selectOrder, selectEntities],
  (order, map) => order.map((id) => map[id]).filter(Boolean)
);

export const selectRedCount = createSelector([selectAllDrones], (arr) =>
  arr.reduce((acc, d) => acc + (d.allowed ? 0 : 1), 0)
);

export const selectPointsFC = createSelector([selectAllDrones], (arr) => ({
  type: 'FeatureCollection',
  features: arr.map((d) => ({
    type: 'Feature',
    id: d.id,
    properties: {
      id: d.id,
      name: d.name,
      altitude: d.altitude,
      firstSeen: d.firstSeen,
      yaw: d.yaw,
      allowed: d.allowed ? 1 : 0,
    },
    geometry: { type: 'Point', coordinates: d.coord },
  })),
}));

export const selectLinesFC = createSelector([selectAllDrones], (arr) => ({
  type: 'FeatureCollection',
  features: arr
    .filter((d) => d.path && d.path.length > 1)
    .map((d) => ({
      type: 'Feature',
      id: `line-${d.id}`,
      properties: { id: d.id, allowed: d.allowed ? 1 : 0 },
      geometry: { type: 'LineString', coordinates: d.path },
    })),
}));