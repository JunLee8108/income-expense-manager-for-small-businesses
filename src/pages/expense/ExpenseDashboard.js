import "./ExpenseDashboard.css";
import { selectMonthOptions } from "../../component/util/data";
import useMonthName from "../../component/common/useMonthName";

import React, { useState } from "react";

import { Bar, Line } from "react-chartjs-2";
// eslint-disable-next-line
import Chart from "chart.js/auto";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ExpenseDashboard = ({
  expenseData,
  selectedYear,
  selectedMonth,
  itemCount,
  total,
  isIncomeView,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [containerNumber, setContainerNumber] = useState(-1);

  const monthToInt = selectMonthOptions.findIndex(
    (content) => content.value === selectedMonth
  );

  const monthName = useMonthName(selectedMonth);

  const handleComputeTotalExpenses = (type) => {
    let copy;

    if (type === "month") {
      if (selectedMonth === "All") {
        return;
      }

      copy = [...expenseData].filter(
        (a) => a.year === parseInt(selectedYear) && a.month === selectedMonth
      );
    } else if (type === "year") {
      copy = [...expenseData].filter((a) => a.year === parseInt(selectedYear));
    }

    if (copy.length > 0) {
      return copy
        .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
        .toLocaleString("en-US", {
          maximumFractionDigits: 2,
        });
    } else {
      return 0.0;
    }
  };

  const handleCountItems = (type) => {
    let copy;

    if (type === "month") {
      if (selectedMonth === "All") {
        return;
      }

      copy = [...expenseData].filter(
        (a) => a.year === parseInt(selectedYear) && a.month === selectedMonth
      );
    } else if (type === "year") {
      copy = [...expenseData].filter((a) => a.year === parseInt(selectedYear));
    }

    return copy.length;
  };

  const handleExpensesBy = (type) => {
    let copy;

    if (selectedMonth === "All") {
      copy = [...expenseData]
        .filter(
          (a) =>
            a.year === parseInt(selectedYear) &&
            a.from !== "Store" &&
            a.from !== "Employee"
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      copy = [...expenseData]
        .filter(
          (a) =>
            a.year === parseInt(selectedYear) &&
            a.month === selectedMonth &&
            a.from !== "Store" &&
            a.from !== "Employee"
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (type === "from") {
      return copy.reduce((acc, item) => {
        if (item.from in acc) {
          acc[item.from] += parseFloat(item.amount || 0);
        } else {
          acc[item.from] = parseFloat(item.amount || 0);
        }

        return acc;
      }, {});
    } else if (type === "sort") {
      return copy.reduce((acc, item) => {
        if (item.category in acc) {
          acc[item.category] += parseFloat(item.amount || 0);
        } else {
          acc[item.category] = parseFloat(item.amount || 0);
        }

        return acc;
      }, {});
    } else if (type === "category") {
      return copy.reduce((acc, item) => {
        if (item.item in acc) {
          acc[item.item] += parseFloat(item.amount || 0);
        } else {
          acc[item.item] = parseFloat(item.amount || 0);
        }

        return acc;
      }, {});
    }
  };

  const handleBarChartType = (type, bgColor) => {
    const data = handleExpensesBy(type);

    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: "Expense (지출) ",
          data: Object.values(data),
          backgroundColor: bgColor,
          borderWidth: 1,
        },
      ],
    };
  };

  const lineChartDataMonthlyExpenseTrend = () => {
    const copy = [...expenseData].filter(
      (item) => item.year === Number(selectedYear)
    );
    let monthData = {};

    copy.forEach((item) => {
      const month = item.date.split("-")[1];
      // console.log(month);
      if (monthData[month]) {
        monthData[month] += parseFloat(item.amount || 0);
      } else {
        monthData[month] = parseFloat(item.amount || 0);
      }
    });

    const graphData = Object.keys(monthData)
      .sort()
      .map((month) => ({
        month: month,
        value: monthData[month],
      }));

    return {
      labels: graphData.map((item) => item.month),
      datasets: [
        {
          label: "Expense (지출) ",
          data: graphData.map((item) => item.value),
          fill: false,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "#fd8a8a",
          // tension: 0.1,
        },
      ],
    };
  };

  const dataForBarChartByFrom = handleBarChartType(
    "from",
    "rgba(153, 102, 255, 0.6)"
  );
  const dataForBarChartByCategory = handleBarChartType("category", "#2ecc71");
  const dataForBarChartBySort = handleBarChartType("sort", "#fff4bc");
  const dataForLineChart = lineChartDataMonthlyExpenseTrend();

  const handleContainer = (number) => {
    if (number === 0) {
      if (dataForLineChart.datasets[0].data.length > 0) {
        setModalOpen(true);
        setContainerNumber(number);
      }
    } else if (number === 1) {
      if (dataForBarChartByFrom.datasets[0].data.length > 0) {
        setModalOpen(true);
        setContainerNumber(number);
      }
    } else if (number === 2) {
      if (dataForBarChartBySort.datasets[0].data.length > 0) {
        setModalOpen(true);
        setContainerNumber(number);
      }
    } else if (number === 3) {
      if (dataForBarChartByCategory.datasets[0].data.length > 0) {
        setModalOpen(true);
        setContainerNumber(number);
      }
    } else if (number === 4) {
      if (expenseData.length > 0) {
        setModalOpen(true);
        setContainerNumber(number);
      }
    }
  };

  const chartOptions = {
    plugins: {
      legend: {
        onClick: () => {}, // Empty function
        labels: {
          color: "white", // 범례 텍스트 색상을 빨간색으로 변경
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white", // Changes the color of x-axis labels to red
        },
        title: {
          color: "white", // Changes the color of the x-axis title to blue
        },
      },
      y: {
        ticks: {
          color: "white", // Changes the color of y-axis labels to green
        },
        title: {
          color: "white", // Changes the color of the y-axis title to purple
        },
      },
    },
  };

  const modalContainer = (number) => {
    if (number === 0) {
      return (
        <div className="chart-modal-graph-container">
          <h3 className="dashboard-chart-header">
            {selectedYear} (1월 ~ 12월)
          </h3>
          <h3 className="dashboard-chart-subheader">
            * Monthly Expense Trend (월별 지출 현황) *
          </h3>
          <Bar
            data={lineChartDataMonthlyExpenseTrend()}
            options={chartOptions}
          />
        </div>
      );
    } else if (number === 1) {
      return (
        <div className="chart-modal-graph-container">
          <h3 className="dashboard-chart-header">
            {selectedYear}.{selectedMonth} ({selectedMonth}월)
          </h3>
          <h3 className="dashboard-chart-subheader">
            * Expenses by From (출처별) *
          </h3>
          {/* <p className="dashboard-chart-exception">
            * Except for "Store" and "Employee" (Store 및 Employee 제외)
          </p> */}
          <Bar
            data={handleBarChartType("from", "rgba(153, 102, 255, 0.6)")}
            options={chartOptions}
          />
        </div>
      );
    } else if (number === 2) {
      return (
        <div className="chart-modal-graph-container">
          <h3 className="dashboard-chart-header">
            {selectedYear}.{selectedMonth} ({selectedMonth}월)
          </h3>
          <h3 className="dashboard-chart-subheader">
            * Expenses by Sort (종류별) *
          </h3>
          {/* <p className="dashboard-chart-exception">
            * Except for "Store" and "Employee" (Store 및 Employee 제외)
          </p> */}
          <Bar
            data={handleBarChartType("sort", "#fff4bc")}
            options={chartOptions}
          />
        </div>
      );
    } else if (number === 3) {
      return (
        <div className="chart-modal-graph-container">
          <h3 className="dashboard-chart-header">
            {selectedYear}.{selectedMonth} ({selectedMonth}월)
          </h3>
          <h3 className="dashboard-chart-subheader">
            * Expenses by Category (세부 품목별) *
          </h3>
          {/* <p className="dashboard-chart-exception">
            * Except for "Store" and "Employee" (Store 및 Employee 제외)
          </p> */}
          <Bar
            data={handleBarChartType("category", "#2ecc71")}
            options={chartOptions}
          />
        </div>
      );
    } else if (number === 4) {
      return (
        <div className="chart-modal-graph-container">
          {handleLargestAmount()}
        </div>
      );
    }
  };

  const handleAmountChangeForMonth = () => {
    const previousMonthToInt = monthToInt - 1;

    if (previousMonthToInt > 0) {
      const IntToPreviousMonth = selectMonthOptions.find(
        (content) => content.id === previousMonthToInt
      );

      const IntToCurrentMonth = selectMonthOptions.find(
        (content) => content.id === monthToInt
      );

      let copyPreviousMonth = [...expenseData]
        .filter(
          (a) =>
            a.year === parseInt(selectedYear) &&
            a.month === IntToPreviousMonth.value
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (copyPreviousMonth.length === 0) {
        return;
      }

      let copyCurrentMonth = [...expenseData]
        .filter(
          (a) =>
            a.year === parseInt(selectedYear) &&
            a.month === IntToCurrentMonth.value
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const currentMonthTotal = copyCurrentMonth
        .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
        .toFixed(2);

      const previousMonthTotal = copyPreviousMonth
        .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
        .toFixed(2);

      const compareTwoMonths = (
        ((parseFloat(currentMonthTotal) - parseFloat(previousMonthTotal)) /
          parseFloat(previousMonthTotal)) *
        100
      ).toFixed(2);

      if (parseFloat(compareTwoMonths) > 0) {
        return (
          <span style={{ marginLeft: "10px", fontSize: "0.9rem" }}>
            vs. last month
            <FontAwesomeIcon
              icon="fa-solid fa-up-long"
              // size="lg"
              color="#ff073a"
              style={{ marginRight: "5px", marginLeft: "8px" }}
            />
            {compareTwoMonths}%
          </span>
        );
      } else {
        return (
          <span style={{ marginLeft: "10px", fontSize: "0.9rem" }}>
            vs. last month
            <FontAwesomeIcon
              icon="fa-solid fa-down-long"
              // size="lg"
              color="#39ff14"
              style={{ marginRight: "5px", marginLeft: "8px" }}
            />
            {Math.abs(compareTwoMonths)}%
          </span>
        );
      }
    }
  };

  const handleAmountChangeForYear = () => {
    if (selectedYear > 2023) {
      let copyPreviousYear = [...expenseData]
        .filter((a) => a.year === parseInt(selectedYear - 1))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (copyPreviousYear.length === 0) {
        return;
      }

      let copyCurrentYear = [...expenseData]
        .filter((a) => a.year === parseInt(selectedYear))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (copyCurrentYear.length === 0) {
        return;
      }

      const currentYearTotal = copyCurrentYear
        .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
        .toFixed(2);

      const previousYearTotal = copyPreviousYear
        .reduce((total, item) => total + parseFloat(item.amount || 0), 0)
        .toFixed(2);

      const compareTwoMonths = (
        ((parseFloat(currentYearTotal) - parseFloat(previousYearTotal)) /
          parseFloat(previousYearTotal)) *
        100
      ).toFixed(2);

      if (parseFloat(compareTwoMonths) > 0) {
        return (
          <span style={{ marginLeft: "10px", fontSize: "0.9rem" }}>
            vs. last year
            <FontAwesomeIcon
              icon="fa-solid fa-up-long"
              // size="lg"
              color="blue"
              style={{ marginRight: "5px", marginLeft: "8px" }}
            />
            {compareTwoMonths}%
          </span>
        );
      } else {
        return (
          <span style={{ marginLeft: "10px", fontSize: "0.9rem" }}>
            vs. last year
            <FontAwesomeIcon
              icon="fa-solid fa-down-long"
              // size="lg"
              color="#ff073a"
              style={{ marginRight: "5px", marginLeft: "8px" }}
            />
            {Math.abs(compareTwoMonths)}%
          </span>
        );
      }
    }
  };

  const handleLargestAmount = () => {
    let filteredData;

    if (selectedMonth === "All") {
      filteredData = [...expenseData].filter(
        (a) =>
          a.year === parseInt(selectedYear) &&
          a.from !== "Store" &&
          a.from !== "Employee"
      );
    } else {
      filteredData = [...expenseData].filter(
        (a) =>
          a.year === parseInt(selectedYear) &&
          a.month === selectedMonth &&
          a.from !== "Store" &&
          a.from !== "Employee"
      );
    }

    const largestAmount = Math.max(...filteredData.map((i) => i.amount));
    const largestAmountIndex = filteredData.findIndex(
      (content) => parseFloat(content.amount) === largestAmount
    );

    if (filteredData.length > 0) {
      return (
        <>
          <h3 className="dashboard-chart-header">
            {selectedYear}.{selectedMonth} ({selectedMonth}월)
          </h3>

          <h3 className="dashboard-chart-subheader">
            * Most Expensive Item (가장 비싼 아이템) *
          </h3>

          {/* <p className="dashboard-chart-exception">
            * Except for "Store" and "Employee" (Store 및 Employee 제외)
          </p> */}

          <table className="dashboard-expensive-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td style={{ whiteSpace: "normal" }}>
                  {filteredData[largestAmountIndex].date}
                </td>
                <td style={{ whiteSpace: "normal" }}>
                  {filteredData[largestAmountIndex].from}
                </td>
                <td style={{ whiteSpace: "normal" }}>
                  {filteredData[largestAmountIndex].item}
                </td>
                <td style={{ whiteSpace: "normal" }}>
                  ${" "}
                  {parseFloat(
                    filteredData[largestAmountIndex].amount
                  ).toLocaleString("en-US", {
                    // minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      );
    } else {
      return (
        <h3 className="dashboard-chart-no-data-header">No Data to show</h3>
      );
    }
  };

  ///////////////// RETURN /////////////////
  return (
    <>
      <div className="dashboard-container animation">
        <h2 className="dashboard-header">
          <FontAwesomeIcon
            icon="fa-regular fa-calendar"
            style={{ marginRight: "10px", width: "18px" }}
            size="sm"
          />
          {selectedYear} {selectedMonth === "All" ? "All" : `${monthName} `}
        </h2>

        {/* <h2 className="dashboard-month-name">
          {selectedYear} {selectedMonth === "All" ? "All" : `${monthName} `}
        </h2> */}

        <h2 className="dashboard-month-name-korean">
          {selectedMonth === "All" ? "(전체)" : `(${Number(selectedMonth)}월) `}
        </h2>

        <h1 style={{ fontSize: "1.8rem" }}>• Overview</h1>

        <div className="dashboard-top-container">
          <div className="dashboard-top-content">
            <h2>
              <span style={{ marginRight: "5px" }}>$</span>10,000
            </h2>
            <h3>Income</h3>
          </div>
          <div className="dashboard-top-content">
            <h2>
              <span style={{ marginRight: "5px" }}>$</span>
              {parseFloat(total).toLocaleString("en-US")}
            </h2>
            <h3>Expense</h3>
          </div>
          <div className="dashboard-top-content">
            <h2>
              <span style={{ marginRight: "5px" }}>$</span>
              {(10000 - parseFloat(total)).toLocaleString("en-US")}
            </h2>
            <h3>Balance</h3>
          </div>
          <div className="dashboard-top-content">
            <h2>{itemCount || 0}</h2>
            <h3>Transactions</h3>
          </div>
        </div>

        <h1 style={{ fontSize: "1.8rem" }}>
          • {isIncomeView === "Expense" ? "Expense" : "Income"} Charts
        </h1>

        <div className="dashboard-chart-container">
          {/* BAR CHART */}
          <div
            className="dashboard-bar-container"
            onClick={() => {
              handleContainer(0);
            }}
          >
            {dataForLineChart.datasets[0].data.length === 0 ? (
              <h3 className="dashboard-chart-no-data-header">
                No Data to show{" "}
              </h3>
            ) : (
              <>
                {/* <h3 className="dashboard-chart-header">
                  {selectedYear} (1월 ~ 12월){" "}
                </h3> */}
                <h3 className="dashboard-chart-subheader">
                  Monthly Expense Trend (월별 지출 현황)
                </h3>
                <Bar
                  data={lineChartDataMonthlyExpenseTrend()}
                  options={chartOptions}
                />
              </>
            )}
          </div>

          {/* BAR CHART BY FROM */}
          <div
            className="dashboard-bar-container"
            onClick={() => {
              handleContainer(1);
            }}
          >
            {dataForBarChartByFrom.datasets[0].data.length === 0 ? (
              <h3 className="dashboard-chart-no-data-header">
                No Data to show
              </h3>
            ) : (
              <>
                {/* <h3 className="dashboard-chart-header">
                  {selectedYear} {monthName} ({Number(selectedMonth)}월)
                </h3> */}
                <h3 className="dashboard-chart-subheader">
                  Expense by from (출처별)
                </h3>
                {/* <p className="dashboard-chart-exception">
                  * Except for "Store" and "Employee" (Store 및 Employee 제외)
                </p> */}
                <Bar
                  data={handleBarChartType("from", "#9ea1d4")}
                  options={chartOptions}
                />
              </>
            )}
          </div>

          {/* BAR CHART BY SORT*/}
          <div
            className="dashboard-bar-container"
            onClick={() => {
              handleContainer(2);
            }}
          >
            {dataForBarChartBySort.datasets[0].data.length === 0 ? (
              <h3 className="dashboard-chart-no-data-header">
                No Data to show
              </h3>
            ) : (
              <>
                {/* <h3 className="dashboard-chart-header">
                  {selectedYear} {monthName} ({Number(selectedMonth)}월)
                </h3> */}
                <h3 className="dashboard-chart-subheader">
                  Expense by category (종류별)
                </h3>
                {/* <p className="dashboard-chart-exception">
                  * Except for "Store" and "Employee" (Store 및 Employee 제외)
                </p> */}
                <Bar
                  data={handleBarChartType("sort", "#a8d1d1")}
                  options={chartOptions}
                />
              </>
            )}
          </div>

          {/* BAR CHART BY CATEGORY */}
          <div
            className="dashboard-bar-container"
            onClick={() => {
              handleContainer(3);
            }}
          >
            {dataForBarChartByCategory.datasets[0].data.length === 0 ? (
              <h3 className="dashboard-chart-no-data-header">
                No Data to show
              </h3>
            ) : (
              <>
                {/* <h3 className="dashboard-chart-header">
                  {selectedYear} {monthName} ({Number(selectedMonth)}월)
                </h3> */}
                <h3 className="dashboard-chart-subheader">
                  Expense by item (세부 품목별)
                </h3>
                {/* <p className="dashboard-chart-exception">
                  * Except for "Store" and "Employee" (Store 및 Employee 제외)
                </p> */}
                <Bar
                  data={handleBarChartType("category", "#ffee93")}
                  options={chartOptions}
                />
              </>
            )}
          </div>

          {/* MOST EXPENSIVE ITEM */}
          {/* <div
            className="dashboard-line-container"
            onClick={() => {
              handleContainer(4);
            }}
          >
            {handleLargestAmount()}
          </div> */}
        </div>
      </div>

      {isModalOpen ? (
        <div
          className="chart-modal-bg"
          onClick={(e) => {
            const target = document.querySelector(".chart-modal-bg");
            if (e.target === target) {
              setModalOpen(false);
            }
          }}
        >
          <div className="chart-modal-container animation">
            <div className="chart-modal-btn-container">
              <button
                className="chart-modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                X
              </button>
            </div>
            {modalContainer(containerNumber)}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ExpenseDashboard;
