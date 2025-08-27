
export default function Topbar() {
  return (
    <header className="topbar">
      <div className="left">
        <img src="/icons/SaqerLogo.png" alt="logo" className="logo" />
      </div> 

      <div className="right">
        <button className="icon-btn" title="Fullscreen">
          <img src="/icons/capture-svgrepo-com.svg" alt="fullscreen" />
        </button>
        <button className="icon-btn" title="Language">
          <img src="/icons/language-svgrepo-com.svg" alt="language" />
        </button>
        <button className="icon-btn notif" title="Notifications">
          <img src="/icons/bell.svg" alt="notifications" />
          <span className="badge">8</span>
        </button>
          <span className="v-divider" aria-hidden="true"></span>
         <div className="user">
          <div className="hello">
            Hello, <span className="name">Mohammed Omar</span>
          </div>
          <div className="role">Technical Support</div>
        </div>
      </div>
    </header>
  );
}