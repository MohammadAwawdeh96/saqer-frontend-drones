import { useSelector, useDispatch } from "react-redux";
import {
  selectAllDrones,
  selectSelectedId,
  selectRedCount,
  setSelected,
} from "../../store/dronesSlice";
import DroneListItem from "./DroneListItem";
import "./DronePanel.css";

export default function DronePanel() {
  const drones = useSelector(selectAllDrones);
  const selectedId = useSelector(selectSelectedId);
  const redCount = useSelector(selectRedCount);
  const dispatch = useDispatch();

  return (
    <aside className="drone-panel">
      {/* ------- Header ------- */}
      <div className="panel-header">
        <h3>DRONE FLYING</h3>
        <button className="close-btn" title="Close">✖</button>
      </div>

      {/* ------- Tabs ------- */}
      <div className="panel-tabs">
        <button className="tab active">Drones</button>
        <button className="tab">Flights History</button>
      </div>

      {/* ------- List ------- */}
      <div className="panel-list">
        {drones && drones.length > 0 ? (
          drones.map((d) => (
            <DroneListItem
              key={d.id}
              drone={d}
            
              active={d.id === selectedId}
              onClick={() => dispatch(setSelected(d.id))}
            />
          ))
        ) : (
          <div className="empty-list">🚁 There are No Drones currently 🚁</div>
        )}
      </div>

      <div className="panel-footer">
        <span>{redCount}</span> Drone Flying (Red)
      </div>
    </aside>
  );
}
