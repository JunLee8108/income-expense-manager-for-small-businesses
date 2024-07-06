import React from "react";

function HeaderDisplay({ isSearching, month, year, monthName }) {
  return (
    <div className={`${isSearching ? "hidden" : "visible"}`}>
      <h2 className="main-header">
        {month === "All" ? "All" : monthName}{" "}
        <span className="main-year">{year}</span>
      </h2>
      <h2 className="main-sub-header">
        {month === "All" ? "" : `(${Number(month)}월)`}
      </h2>
    </div>
  );
}

export default HeaderDisplay;
