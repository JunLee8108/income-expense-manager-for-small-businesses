import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function SearchAndFilter({
  isSearching,
  setSearchQuery,
  handleFilter,
  isFilterOn,
  filters,
  updateFilter,
  filterReset,
  expenseCategoryTabs,
}) {
  return (
    <>
      <div className={`search-header ${isSearching ? "visible" : "hidden"}`}>
        <h1>Search</h1>
      </div>

      <div className="item-search-filter-container">
        <input
          type="search"
          placeholder="🔍 Search.."
          onChange={(e) => setSearchQuery(e.target.value)}
        ></input>
        <button
          onClick={handleFilter}
          className={`item-filter-button ${
            isFilterOn ? "filter-active" : null
          }`}
        >
          FILTER (필터)
        </button>
      </div>

      {isFilterOn && (
        <div className="filters-container">
          <form className="filters animation-x">
            <div className="filters-input-container">
              <label htmlFor="filter-category">Category</label>
              <select
                value={filters.filterCategory}
                onChange={(e) => updateFilter("filterCategory", e.target.value)}
                id="filter-category"
              >
                <option value="All">모든 카테고리</option>
                {expenseCategoryTabs.map((item, index) => {
                  return (
                    <option value={item.name} key={index}>
                      {item}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="filters-input-container">
              <label>Minimum Amount</label>
              <input
                type="number"
                placeholder="최소 금액"
                value={filters.minAmount}
                onChange={(e) => updateFilter("minAmount", e.target.value)}
              />
            </div>

            <div className="filters-input-container">
              <label>Maximum Amount</label>
              <input
                type="number"
                placeholder="최대 금액"
                value={filters.maxAmount}
                onChange={(e) => updateFilter("maxAmount", e.target.value)}
              />
            </div>

            <div className="filters-input-container">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter("startDate", e.target.value)}
              />
            </div>

            <div className="filters-input-container">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter("endDate", e.target.value)}
              />
            </div>

            <div className="filters-input-container">
              <label>Reset</label>
              <button type="reset" onClick={filterReset}>
                Reset
              </button>
            </div>
          </form>

          <center className="animation-x">
            <button className="filters-close" onClick={handleFilter}>
              <FontAwesomeIcon icon="fa-regular fa-circle-xmark" />
            </button>
          </center>
        </div>
      )}
    </>
  );
}

export default SearchAndFilter;
