import "./App.css";
import Landing from "./pages/home/Landing";

import { Routes, Route } from "react-router-dom";
import { useCallback } from "react";

import ExpenseManager from "./pages/expense/ExpenseManager";
import IncomeManager from "./pages/income/IncomeManager";

function App() {
  /**
   * sort data by date and set state
   * @param {array} copy data array
   */
  const sortByDate = useCallback((copy, toggle, setItem) => {
    copy.sort((a, b) => {
      let fa = a.sort.toLowerCase();
      let fb = b.sort.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    copy.sort((a, b) => {
      let fa = a.from.toLowerCase();
      let fb = b.from.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    copy.sort(
      (a, b) =>
        parseInt(a.date.replaceAll("-", "")) -
        parseInt(b.date.replaceAll("-", ""))
    );

    if (toggle === "on") {
      setItem(copy);
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/expense" element={<ExpenseManager />} />
        <Route
          path="/income"
          element={<IncomeManager sortByDate={sortByDate} />}
        />
      </Routes>
    </>
  );
}

export default App;
