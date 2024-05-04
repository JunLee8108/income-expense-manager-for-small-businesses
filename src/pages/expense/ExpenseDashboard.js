import "./ExpenseDashboard.css";
import ChartModal from "./component/ChartModal";
import useMonthName from "../../component/common/useMonthName";

import React, { useState, useMemo, useCallback } from "react";

import { Bar } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// eslint-disable-next-line
import Chart from "chart.js/auto";

const ExpenseDashboard = ({
  expenseData,
  selectedYear,
  selectedMonth,
  itemCount,
  total,
  isIncomeView,
}) => {
  const [isModal, setModal] = useState(false);
  const [propsChartData, setPropsChartData] = useState("");
  const [modalHeader, setModalHeader] = useState("");

  const handleBarContainer = (type, header) => () => {
    setModal(true);
    setPropsChartData(type);
    setModalHeader(header);
  };

  const chartOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          onClick: () => {},
          labels: {
            color: "white",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "white",
          },
          title: {
            color: "white",
          },
        },
        y: {
          ticks: {
            color: "white",
          },
          title: {
            color: "white",
          },
        },
      },
    }),
    []
  );

  const filteredData = useMemo(() => {
    if (selectedMonth === "All") {
      return expenseData.filter((a) => a.year === parseInt(selectedYear));
    } else {
      return expenseData.filter(
        (a) => a.year === parseInt(selectedYear) && a.month === selectedMonth
      );
    }
  }, [expenseData, selectedYear, selectedMonth]);

  const sortedData = useMemo(() => {
    return filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);

  const BarChartDataMonthlyExpenseTrend = () => {
    const data = expenseData.filter(
      (item) => item.year === Number(selectedYear)
    );

    let monthData = {};

    data.forEach((item) => {
      const month = item.date.split("-")[1];
      if (monthData[month]) {
        monthData[month] += parseFloat(item.amount || 0);
      } else {
        monthData[month] = parseFloat(item.amount || 0);
      }
    });

    const graphData = Object.keys(monthData)
      .sort()
      .map((month) => ({
        month: month + "(월)",
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

  const dataForBarChart = BarChartDataMonthlyExpenseTrend();

  const handleExpensesBy = useCallback(
    (type) => {
      return sortedData.reduce((acc, item) => {
        const key = item[type];
        if (key in acc) {
          acc[key] += parseFloat(item.amount || 0);
        } else {
          acc[key] = parseFloat(item.amount || 0);
        }
        return acc;
      }, {});
    },
    [sortedData]
  );

  const createChartData = useCallback((data, label, bgColor) => {
    return {
      labels: Object.keys(data),
      datasets: [
        {
          label,
          data: Object.values(data),
          backgroundColor: bgColor,
          borderWidth: 1,
        },
      ],
    };
  }, []);

  const dataForBarChartByFrom = useMemo(
    () =>
      createChartData(
        handleExpensesBy("from"),
        "Expense (지출) ",
        "rgba(153, 102, 255, 0.6)"
      ),
    [handleExpensesBy, createChartData]
  );
  const dataForBarChartByCategory = useMemo(
    () =>
      createChartData(
        handleExpensesBy("category"),
        "Expense (지출) ",
        "#2ecc71"
      ),
    [handleExpensesBy, createChartData]
  );
  const dataForBarChartByItem = useMemo(
    () =>
      createChartData(handleExpensesBy("item"), "Expense (지출) ", "#fdfd96"),
    [handleExpensesBy, createChartData]
  );

  const monthName = useMonthName(selectedMonth);

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

        <h2 className="dashboard-month-name-korean">
          {selectedMonth === "All" ? "(전체)" : `(${Number(selectedMonth)}월) `}
        </h2>

        <h1 className="dashboard-header-2">
          <span className="dashboard-header-2-symbol">🟣</span> Overview
        </h1>

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

        <h1 className="dashboard-header-2">
          <span className="dashboard-header-2-symbol">🟣</span>{" "}
          {isIncomeView === "Expense" ? "Expense" : "Income"} Charts
        </h1>

        <div className="dashboard-chart-container">
          {dataForBarChart.datasets[0].data.length > 0 && (
            <div
              className="dashboard-bar-container"
              onClick={handleBarContainer(
                BarChartDataMonthlyExpenseTrend(),
                "Monthly Expense Trend (월별 지출 현황)"
              )}
            >
              <h3 className="dashboard-chart-subheader">
                Monthly Expense Trend (월별 지출 현황)
              </h3>
              <Bar
                data={BarChartDataMonthlyExpenseTrend()}
                options={chartOptions}
              />
            </div>
          )}

          {/* BAR CHART BY FROM */}
          {dataForBarChartByFrom.datasets[0].data.length > 0 && (
            <div
              className="dashboard-bar-container"
              onClick={handleBarContainer(
                dataForBarChartByFrom,
                "Expense by from (출처별)"
              )}
            >
              <h3 className="dashboard-chart-subheader">
                Expense by from (출처별)
              </h3>
              <Bar data={dataForBarChartByFrom} options={chartOptions} />
            </div>
          )}

          {/* BAR CHART BY ITEM*/}
          {dataForBarChartByCategory.datasets[0].data.length > 0 && (
            <div
              className="dashboard-bar-container"
              onClick={handleBarContainer(
                dataForBarChartByCategory,
                "Expense by category (종류별)"
              )}
            >
              <h3 className="dashboard-chart-subheader">
                Expense by category (종류별)
              </h3>
              <Bar data={dataForBarChartByCategory} options={chartOptions} />
            </div>
          )}

          {/* BAR CHART BY ITEM */}
          {dataForBarChartByItem.datasets[0].data.length > 0 && (
            <div
              className="dashboard-bar-container"
              onClick={handleBarContainer(
                dataForBarChartByItem,
                "Expense by item (세부 품목별)"
              )}
            >
              <h3 className="dashboard-chart-subheader">
                Expense by item (세부 품목별)
              </h3>
              <Bar data={dataForBarChartByItem} options={chartOptions} />
            </div>
          )}
        </div>
      </div>

      {isModal && (
        <ChartModal
          propsChartData={propsChartData}
          modalHeader={modalHeader}
          setModal={setModal}
          chartOptions={chartOptions}
        />
      )}
    </>
  );
};

export default ExpenseDashboard;
