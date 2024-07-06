import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SwitchManagers({ setIncomeView, isIncomeView }) {
  const storeName = localStorage.getItem("storeName");

  return (
    <section className="app-income-expense-switch">
      {/* <h1 style={{ width: "30%" }}>{storeName}</h1> */}

      <h1
        onClick={() => setIncomeView("Expense")}
        className={` ${isIncomeView === "Expense" && "expense"}`}
      >
        Expense <FontAwesomeIcon icon="fa-solid fa-money-check-dollar" /> (지출)
      </h1>

      <h1
        onClick={() => setIncomeView("Income")}
        className={` ${isIncomeView === "Income" && "income"}`}
      >
        Income <FontAwesomeIcon icon="fa-solid fa-money-bill-trend-up" /> (수입)
      </h1>
    </section>
  );
}
