import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SwitchManagers({ setIncomeView, isIncomeView }) {
  return (
    <section className="app-income-expense-switch">
      <h1
        onClick={() => setIncomeView("Expense")}
        className={` ${isIncomeView === "Expense" && "expense"}`}
      >
        Expense <FontAwesomeIcon icon="fa-solid fa-money-check-dollar" />
      </h1>

      <FontAwesomeIcon icon="fa-solid fa-arrows-left-right" />

      <h1
        onClick={() => setIncomeView("Income")}
        className={` ${isIncomeView === "Income" && "income"}`}
      >
        Income <FontAwesomeIcon icon="fa-solid fa-money-bill-trend-up" />
      </h1>
    </section>
  );
}
