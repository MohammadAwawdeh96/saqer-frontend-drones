import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  entities: {},     // تخزين التفاصيل keyed بالـ registration
  order: [],        // ترتيب الإدخال
  selectedId: null,
  hoveredId: null,
  lastUpdate: null,
};

// ✅ يحدد إن الطائرة مسموح بها إذا كان رقم التسجيل يبدأ بـ B
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
        const id = p.registration;           // ✅ نستخدم registration كمفتاح أساسي
        const coord = f.geometry?.coordinates;

        if (!id || !Array.isArray(coord)) continue; // تأكد إن التسجيل والإحداثية صح

        const allowed = isAllowed(p.registration);
        const prev = state.entities[id];

        if (!prev) {
          // ✅ إنشاء كيان جديد
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
            path: [coord], // يبدأ المسار بأول نقطة
          };
          state.order.push(id);
        } else {
          // ✅ تحديث كيان موجود
          const path = [...prev.path];
          const last = path[path.length - 1];

          // أضف النقطة الجديدة فقط لو مختلفة عن آخر نقطة
          if (!last || last[0] !== coord[0] || last[1] !== coord[1]) {
            path.push(coord);
          }

          state.entities[id] = {
            ...prev,
            serial: p.serial ?? prev.serial,
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
    setSelected(state, action) {
      state.selectedId = action.payload;
    },
    setHovered(state, action) {
      state.hoveredId = action.payload;
    },
  },
});

export const { upsertFromFeatureCollection, setSelected, setHovered } = dronesSlice.actions;
export default dronesSlice.reducer;

// ==================
// ✅ Selectors
// ==================
const selectSlice = (s) => s.drones;

export const selectOrder = (s) => selectSlice(s).order;
export const selectEntities = (s) => selectSlice(s).entities;
export const selectSelectedId = (s) => selectSlice(s).selectedId;
export const selectHoveredId = (s) => selectSlice(s).hoveredId;

// ❇️ جميع الطائرات بالترتيب
export const selectAllDrones = createSelector(
  [selectOrder, selectEntities],
  (order, map) => order.map((id) => map[id]).filter(Boolean)
);

// ❇️ العدّاد للطائرات "غير المسموح بها" (حمراء)
export const selectRedCount = createSelector([selectAllDrones], (arr) =>
  arr.reduce((acc, d) => acc + (d.allowed ? 0 : 1), 0)
);

// ❇️ نقاط الطائرات (Point features)
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

// ❇️ خطوط المسارات (LineString features)
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