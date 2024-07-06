import "./IncomeManager.css";
import { useState, useMemo, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { incomeDataState, incomeHeadersState } from "../../recoil/store";

import useMonthName from "../../component/common/useMonthName";
import { useSortByDate } from "../../component/common/useSortByDate";
import { useSortNumbers } from "../../component/common/useSortNumber";
import { useSortStrings } from "../../component/common/useSortStrings";

import HeaderDisplay from "./component/HeaderDisplay";
import YesNoModal from "../../component/common/modal/YesNoModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function IncomeManager({ year, month }) {
  const [incomeData, setIncomeData] = useRecoilState(incomeDataState);
  const incomeHeaders = useRecoilValue(incomeHeadersState);

  const monthName = useMonthName(month);
  const sortByDate = useSortByDate();
  const sortStrings = useSortStrings();
  const sortNumbers = useSortNumbers();

  const [isConfirmModal, setConfirmModal] = useState(false);
  const [message, setMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "ascending",
    type: "date",
  });

  const [editIndex, setEditIndex] = useState(-1);
  const [editedData, setEditedData] = useState({});
  const [deleteIndex, setDeleteIndex] = useState(-1);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page
  const [pageGroup, setPageGroup] = useState(0); // To handle page groups

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredData = useMemo(() => {
    if (debouncedSearchQuery) {
      return incomeData.filter((item) => {
        const normalizedSearchQuery = debouncedSearchQuery
          .toLowerCase()
          .replace(/\s+/g, "");
        return (
          item.source
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(normalizedSearchQuery) ||
          item.date
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(normalizedSearchQuery)
        );
      });
    }

    return incomeData.filter((item) => {
      const parts = item.date.split("-");
      const matchDate =
        (parts[1] === month || month === "All") && Number(parts[0]) === year;

      return matchDate;
    });
  }, [incomeData, month, year, debouncedSearchQuery]);

  const calculateTotals = useMemo(() => {
    const totals = { amount: 0, count: 0 };

    filteredData.forEach((item) => {
      totals.amount += item.total || 0;
      totals.count += 1;
    });

    totals.amount = totals.amount.toFixed(2);

    return totals;
  }, [filteredData]);

  const total = calculateTotals.amount;
  const itemCount = calculateTotals.count;

  const handleSort = (key, type) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction, type });
  };

  const handleEdit = (index) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    setEditIndex(actualIndex);
    setEditedData(incomeData[actualIndex]);
  };

  const handleDelete = (index) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    setDeleteIndex(actualIndex);
    setMessage("Do you want to remove it?");
    setConfirmModal(true);
  };

  const handleSave = () => {
    const updatedData = [...incomeData];
    updatedData[editIndex] = editedData;
    setIncomeData(updatedData);
    setEditIndex(-1);
  };

  const handleCancel = () => {
    setEditIndex(-1);
    setEditedData({});
  };

  const handleOnConfirm = () => {
    const updatedData = [...incomeData];
    updatedData.splice(deleteIndex, 1);
    setIncomeData(updatedData);
    setConfirmModal(false);
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  useEffect(() => {
    if (sortConfig.type === "date") {
      sortByDate(incomeData, setIncomeData, sortConfig.direction);
    } else if (sortConfig.type === "text") {
      sortStrings(
        incomeData,
        setIncomeData,
        sortConfig.direction,
        sortConfig.key
      );
    } else if (sortConfig.type === "number") {
      sortNumbers(
        incomeData,
        setIncomeData,
        sortConfig.direction,
        sortConfig.key
      );
    }
  }, [sortConfig]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const handleNextPageGroup = () => {
    const newPageGroup = pageGroup + 1;
    setPageGroup(newPageGroup);
    setCurrentPage(newPageGroup * 5 + 1);
  };

  const handlePreviousPageGroup = () => {
    const newPageGroup = pageGroup - 1;
    setPageGroup(newPageGroup);
    setCurrentPage(newPageGroup * 5 + 5);
  };

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const pageGroups = pages.slice(pageGroup * 5, (pageGroup + 1) * 5);

  return (
    <>
      <div className="income-manager animation">
        <HeaderDisplay month={month} year={year} monthName={monthName} />

        <div className="income-summary">
          <div className="income-summary-item">
            <span className="income-summary-label">Number of Entries</span>
            <span className="income-summary-value">{itemCount}</span>
          </div>
          <div className="income-summary-item">
            <span className="income-summary-label">Total Income</span>
            <span className="income-summary-value">${total}</span>
          </div>
        </div>

        <div className="income-actions">
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="income-item-per-page">
          <select onChange={handleItemsPerPageChange} value={itemsPerPage}>
            <option value={2}>2 per page</option>
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>

        <table className="income-table">
          <thead>
            <tr>
              {incomeHeaders.map(({ key, label, type, role }) => (
                <th key={key} onClick={() => handleSort(key, type)}>
                  {label} {role === "+" || role === "-" ? `(${role})` : ""}
                  {sortConfig.key === key && (
                    <FontAwesomeIcon
                      icon={
                        sortConfig.direction === "ascending"
                          ? "fa-solid fa-arrow-up"
                          : "fa-solid fa-arrow-down"
                      }
                      style={{
                        marginLeft: "5px",
                        color: "#4666ff",
                        fontSize: "1rem",
                      }}
                    />
                  )}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index}>
                {incomeHeaders.map(({ key, type }) => (
                  <td key={key}>
                    {editIndex === (currentPage - 1) * itemsPerPage + index ? (
                      <input
                        type={type}
                        value={editedData[key]}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            [key]: e.target.value,
                          })
                        }
                        step={type === "number" ? "0.01" : undefined}
                        min={type === "number" ? "0" : undefined}
                        onWheel={type === "number" ? handleWheel : undefined}
                        disabled={key === "total" ? true : false}
                      />
                    ) : (
                      `${
                        type === "number"
                          ? `$ ${parseFloat(item[key]).toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}`
                          : `${item[key]}`
                      }`

                      // ${item[key]}
                      // item[key]
                    )}
                  </td>
                ))}
                <td>
                  {editIndex === (currentPage - 1) * itemsPerPage + index ? (
                    <div className="income-table-actions">
                      <button onClick={handleSave}>Save</button>
                      <button onClick={handleCancel}>Cancel</button>
                    </div>
                  ) : (
                    <div className="income-table-actions">
                      <button onClick={() => handleEdit(index)}>Edit</button>
                      <button onClick={() => handleDelete(index)}>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="income-pagination">
          <button
            className="income-pagination-button"
            onClick={handlePreviousPageGroup}
            disabled={pageGroup === 0}
          >
            &lt;
          </button>
          {pageGroups.map((page) => (
            <button
              key={page}
              className={`income-pagination-button ${
                page === currentPage ? "income-pagination-active" : ""
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="income-pagination-button"
            onClick={handleNextPageGroup}
            disabled={(pageGroup + 1) * 5 >= totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      {isConfirmModal && (
        <YesNoModal
          setConfirmModal={setConfirmModal}
          isConfirmModal={isConfirmModal}
          message={message}
          onConfirm={handleOnConfirm}
        />
      )}
    </>
  );
}
