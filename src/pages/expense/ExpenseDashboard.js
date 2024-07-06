import "./ExpenseDashboard.css";
import ChartModal from "./component/ChartModal";
import useMonthName from "../../component/common/useMonthName";
import useBodyScrollLock from "../../component/common/useBodyScrollLock";

import React, { useState, useMemo, useCallback } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// eslint-disable-next-line
import Chart from "chart.js/auto";
import { useRecoilValue } from "recoil";
import {
  expenseDataState,
  incomeDataState,
  incomeHeadersState,
} from "../../recoil/store";

const ExpenseDashboard = ({ selectedYear, selectedMonth, isIncomeView }) => {
  const expenseData = useRecoilValue(expenseDataState);
  const incomeData = useRecoilValue(incomeDataState);
  const incomeHeaders = useRecoilValue(incomeHeadersState);

  const monthName = useMonthName(selectedMonth);
  const [lockBodyScroll] = useBodyScrollLock();

  const [isModal, setModal] = useState(false);
  const [propsChartData, setPropsChartData] = useState("");
  const [modalHeader, setModalHeader] = useState("");

  const handleBarContainer = (type, header) => () => {
    setModal(true);
    setPropsChartData(type);
    setModalHeader(header);
    lockBodyScroll();
  };

  const chartOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          onClick: () => {},
          labels: {
            color: "#FFFFFF", // Legend labels color
            // color: "#202020",
            font: {
              size: 14, // Legend font size
              family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif", // Legend font family
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.7)",
          titleFont: {
            size: 16,
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          },
          bodyFont: {
            size: 14,
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          },
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            // color: "#202020",
            color: "#FFFFFF", // X-axis ticks color
          },
          // grid: {
          //   color: "rgba(255, 255, 255, 0.2)", // X-axis grid lines color
          // },
          title: {
            // color: "#202020",
            color: "#FFFFFF", // X-axis title color
          },
        },
        y: {
          ticks: {
            // color: "#202020",
            color: "#FFFFFF", // Y-axis ticks color
          },
          // grid: {
          //   color: "rgba(255, 255, 255, 0.2)", // Y-axis grid lines color
          // },
          title: {
            // color: "#202020",
            color: "#FFFFFF", // Y-axis title color
          },
        },
      },
    }),
    []
  );

  const useFilteredAndSortedData = (data, selectedYear, selectedMonth) => {
    return useMemo(() => {
      let filteredData;
      const year = selectedYear.toString();
      if (selectedMonth === "All") {
        filteredData = data.filter((item) => item.date.split("-")[0] === year);
      } else {
        const month = selectedMonth.toString().padStart(2, "0");
        filteredData = data.filter(
          (item) =>
            item.date.split("-")[0] === year &&
            item.date.split("-")[1] === month
        );
      }
      return filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [data, selectedYear, selectedMonth]);
  };

  const filteredAndSortedExpenseData = useFilteredAndSortedData(
    expenseData,
    selectedYear,
    selectedMonth
  );
  const filteredAndSortedIncomeData = useFilteredAndSortedData(
    incomeData,
    selectedYear,
    selectedMonth
  );

  const calculateTotals = (data) => {
    return data.reduce(
      (totals, item) => {
        totals.amount += item.amount || 0;
        totals.tax += item.tax || 0;
        totals.count += 1;
        return totals;
      },
      { amount: 0, count: 0, tax: 0 }
    );
  };

  const expenseTotals = useMemo(
    () => calculateTotals(filteredAndSortedExpenseData),
    [filteredAndSortedExpenseData]
  );
  const incomeTotals = useMemo(
    () => calculateTotals(filteredAndSortedIncomeData),
    [filteredAndSortedIncomeData]
  );

  const doughnutData = useMemo(
    () => ({
      labels: ["Income", "Expense"],
      datasets: [
        {
          data: [incomeTotals.amount, expenseTotals.amount],
          backgroundColor: ["#a29bfe", "#ff7675"],
          borderColor: ["#fff", "#fff"],
          borderWidth: 2,
        },
      ],
    }),
    [expenseTotals, incomeTotals]
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          // color: "white",
          color: "#202020",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "#ccc",
        borderWidth: 1,
        titleColor: "#333",
        bodyColor: "#666",
        bodyFont: {
          size: 14,
        },
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.raw !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.raw);
            }
            return label;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  const processDataAndCreateChartData = useCallback(
    (data, type, label, bgColor) => {
      let processedData;
      if (label.includes("Income")) {
        processedData = data.reduce((acc, item) => {
          const key = item.source;
          acc[key] = (acc[key] || 0) + parseFloat(item[type] || 0);
          return acc;
        }, {});
      } else {
        processedData = data.reduce((acc, item) => {
          const key = item[type];
          acc[key] = (acc[key] || 0) + parseFloat(item.amount || 0);
          return acc;
        }, {});
      }

      return {
        labels: Object.keys(processedData),
        datasets: [
          {
            label,
            data: Object.values(processedData),
            backgroundColor: bgColor,
            borderWidth: 1,
          },
        ],
      };
    },
    []
  );

  const useChartData = (data, label, color) => {
    return useMemo(() => {
      const year = selectedYear.toString();
      const filteredData = data.filter(
        (item) => item.date.split("-")[0] === year
      );
      let monthData = {};

      filteredData.forEach((item) => {
        const month = item.date.split("-")[1];
        monthData[month] =
          (monthData[month] || 0) + parseFloat(item.amount || item.total || 0);
      });

      const graphData = Object.keys(monthData)
        .sort()
        .map((month) => ({
          month: month + "(월)",
          value: monthData[month],
        }));

      console.log(graphData);

      return {
        labels: graphData.map((item) => item.month),
        datasets: [
          {
            label,
            data: graphData.map((item) => item.value),
            fill: false,
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: color,
          },
        ],
      };
    }, [data, selectedYear, label, color]);
  };

  const expenseDataForBarChart = useChartData(
    expenseData,
    "Expense (지출)",
    "#fd5959"
  );
  const incomeDataForBarChart = useChartData(
    incomeData,
    "Income (수입)",
    "#27296d"
  );

  const expenseChartDataByFrom = useMemo(
    () =>
      processDataAndCreateChartData(
        filteredAndSortedExpenseData,
        "from",
        "Expense (지출)",
        "#ff9c6d"
      ),
    [filteredAndSortedExpenseData, processDataAndCreateChartData]
  );
  const incomeChartDataByFrom = useMemo(
    () =>
      processDataAndCreateChartData(
        filteredAndSortedIncomeData,
        "source",
        "Income (수입)",
        "#a393eb"
      ),
    [filteredAndSortedIncomeData, processDataAndCreateChartData]
  );

  const expenseChartDataByCategory = useMemo(
    () =>
      processDataAndCreateChartData(
        filteredAndSortedExpenseData,
        "category",
        "Expense (지출)",
        "#fcff82"
      ),
    [filteredAndSortedExpenseData, processDataAndCreateChartData]
  );
  const incomeChartDataByCategory = useMemo(
    () =>
      processDataAndCreateChartData(
        filteredAndSortedIncomeData,
        "category",
        "Income (수입)",
        "#fdb44b"
      ),
    [filteredAndSortedIncomeData, processDataAndCreateChartData]
  );

  const expenseChartDataByItem = useMemo(
    () =>
      processDataAndCreateChartData(
        filteredAndSortedExpenseData,
        "item",
        "Expense (지출)",
        "#77dd77"
      ),
    [filteredAndSortedExpenseData, processDataAndCreateChartData]
  );

  const renderBarChart = (data, title) =>
    data.datasets[0].data.length > 0 && (
      <div
        className="dashboard-bar-container"
        onClick={handleBarContainer(data, title)}
      >
        <h3 className="dashboard-chart-subheader">{title}</h3>
        <Bar data={data} options={chartOptions} />
      </div>
    );

  const noData = (
    <h1>
      <FontAwesomeIcon icon="fa-solid fa-ban" /> No Data to show
    </h1>
  );

  return (
    <>
      <div className="dashboard-container animation">
        <h2 className="dashboard-header">
          {/* <FontAwesomeIcon
            icon="fa-regular fa-calendar"
            style={{ marginRight: "10px", width: "18px" }}
            size="sm"
          /> */}
          {selectedMonth === "All" ? "All " : `${monthName} `} {selectedYear} -{" "}
          {isIncomeView}
        </h2>

        <h2 className="dashboard-month-name-korean">
          {selectedMonth === "All" ? "(전체)" : `(${Number(selectedMonth)}월) `}
        </h2>

        <div className="dashboard-doughnut-chart">
          {expenseTotals.amount || incomeTotals.amount ? (
            <h1 className="doughnut-chart-title">
              Income <span style={{ fontSize: "1.5rem" }}>vs.</span> Expense
            </h1>
          ) : null}

          <div className="doughnut-container">
            {expenseTotals.amount || incomeTotals.amount ? (
              <Doughnut
                data={doughnutData}
                options={options}
                width={300}
                height={400}
              />
            ) : (
              <h1>
                <FontAwesomeIcon icon="fa-solid fa-ban" /> No data to show
              </h1>
            )}
          </div>
        </div>

        <div className="dashboard-top-container">
          <div className="dashboard-top-content">
            <h2>
              <span style={{ marginRight: "5px" }}>$</span>
              {parseFloat(incomeTotals.amount).toLocaleString("en-US")}
            </h2>
            <h3>Income</h3>
          </div>
          <div className="dashboard-top-content">
            <h2>
              <span style={{ marginRight: "5px" }}>$</span>
              {parseFloat(expenseTotals.amount).toLocaleString("en-US")}
            </h2>
            <h3>Expense</h3>
          </div>
          <div className="dashboard-top-content">
            <h2>
              <span style={{ marginRight: "5px" }}>$</span>
              {(
                parseFloat(incomeTotals.amount) -
                parseFloat(expenseTotals.amount)
              ).toLocaleString("en-US")}
            </h2>
            <h3>Balance</h3>
          </div>
          <div className="dashboard-top-content">
            <h2>{expenseTotals.count + incomeTotals.count || 0}</h2>
            <h3>Transactions</h3>
          </div>
        </div>

        {/* <h1 className="dashboard-header-2">
          <span className="dashboard-header-2-symbol">🟢</span> {isIncomeView}{" "}
          Details
        </h1> */}

        {/* <h1
          className="doughnut-chart-title"
          style={{
            backgroundColor: "#f4f4f9",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          {isIncomeView} Charts
        </h1> */}

        {/* <h1>
          <span style={{ marginRight: "12px" }}>
            <FontAwesomeIcon
              icon="fa-solid fa-chart-simple"
              style={{ fontSize: "1.6rem", marginLeft: "5px" }}
            />
          </span>
          {isIncomeView} Charts
        </h1> */}

        <div className="dashboard-chart-container">
          {isIncomeView === "Expense" ? (
            <>
              {renderBarChart(
                expenseDataForBarChart,
                "Monthly Expense Trend (월별 지출 현황)"
              )}
              {renderBarChart(
                expenseChartDataByFrom,
                "Expense by from (출처별)"
              )}
              {renderBarChart(
                expenseChartDataByCategory,
                "Expense by category (종류별)"
              )}
              {renderBarChart(
                expenseChartDataByItem,
                "Expense by item (세부 품목별)"
              )}
              {expenseDataForBarChart.datasets[0].data.length === 0 &&
                expenseChartDataByFrom.datasets[0].data.length === 0 &&
                expenseChartDataByCategory.datasets[0].data.length === 0 &&
                expenseChartDataByItem.datasets[0].data.length === 0 &&
                noData}
            </>
          ) : (
            <>
              {renderBarChart(
                incomeDataForBarChart,
                "Monthly Income Trend (월별 수입 현황)"
              )}
              {incomeHeaders.map((header) =>
                header.role === "+" || header.role === "-"
                  ? renderBarChart(
                      processDataAndCreateChartData(
                        filteredAndSortedIncomeData,
                        header.key,
                        `Income by ${header.label} (${header.label}별 수입)`,
                        "#a393eb"
                      ),
                      `Income by ${header.label} (${header.label}별 수입)`
                    )
                  : null
              )}
              {incomeDataForBarChart.datasets[0].data.length === 0 &&
                incomeChartDataByFrom.datasets[0].data.length === 0 &&
                incomeChartDataByCategory.datasets[0].data.length === 0 &&
                noData}
            </>
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
