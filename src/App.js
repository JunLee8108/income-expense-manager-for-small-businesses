import "./App.css";
import Landing from "./pages/home/Landing";

import { Routes, Route } from "react-router-dom";

import ExpenseManager from "./pages/expense/ExpenseManager";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/expense" element={<ExpenseManager />} />
      </Routes>
    </>
  );
}

export default App;
