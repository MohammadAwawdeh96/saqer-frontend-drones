function Item({ iconSrc, label, active, onClick }) {
  return (
    <button className={`side-item ${active ? 'active' : ''}`} onClick={onClick}>
      <img src={iconSrc} alt={label} className="side-icon" />
      <span className="side-label">{label}</span>
    </button>
  );
}

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="sidebar">
      <Item
        iconSrc="/icons/dashboard.svg"
        label="DASHBOARD"
        active={active === 'dashboard'}
        onClick={() => onChange('dashboard')}
      />
      <Item
        iconSrc="/icons/map.svg"
        label="MAP"
        active={active === 'map'}
        onClick={() => onChange('map')}
      />
      <div className="spacer" />
    </aside>
  );
}