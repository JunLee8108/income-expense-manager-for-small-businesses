import { navbarList } from "../../../component/util/data";

export default function Navbar({ viewMode, handleNavbarBtn }) {
  return (
    <section className="app-navbar-container">
      {navbarList.map((content, index) => {
        return (
          <button
            className={`navbar-btn ${
              viewMode === content.name ? "navbar-btn-active" : null
            }`}
            onClick={handleNavbarBtn(content.name)}
            key={index}
          >
            {content.name}
            {content.icon}
          </button>
        );
      })}
    </section>
  );
}
