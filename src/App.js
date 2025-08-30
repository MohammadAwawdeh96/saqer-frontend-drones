import { useState, useEffect } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "./store";
import MapPage from "./pages/MapPage";
import { startSocket } from "./services/socket";
import DroneFloatingIndicator from "./components/panel/DroneFloatingIndicator";
import "mapbox-gl/dist/mapbox-gl.css";
function App() {
  const [active, setActive] = useState("map"); // 'dashboard' | 'map'

  useEffect(() => {
    startSocket(store);
  }, []);

  return (
    <Provider store={store}>
      <div className="layout">
        <Topbar />
        <Sidebar active={active} onChange={setActive} />

        <main className="content">
          {active === "dashboard" && <div></div>}
          {active === "map" && <MapPage />}
        </main>
        <DroneFloatingIndicator />
      </div>
    </Provider>
  );
}

export default App;