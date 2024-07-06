import { navbarList } from "../../../component/util/data";

export default function Navbar({ viewMode, handleNavbarBtn, isIncomeView }) {
  const getHoverClass = () => {
    if (isIncomeView === "Income") {
      return "navbar-btn-income";
    } else if (isIncomeView === "Expense") {
      return "navbar-btn-expense";
    } else {
      return "";
    }
  };

  return (
    <section className="app-navbar-container">
      {navbarList.map((content, index) => {
        return (
          <button
            className={`navbar-btn ${
              viewMode === content.name
                ? isIncomeView === "Income"
                  ? "navbar-btn-active-income"
                  : "navbar-btn-active-expense"
                : ""
            } ${getHoverClass()}`}
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
