import "./ExpenseManager.css";

import { navbarList, foodSortList } from "../../component/util/data";
import { useSortByDate } from "../../component/common/useSortByDate";
import useAutoSaveData from "../../component/common/useAutoSaveData";
import useMonthName from "../../component/common/useMonthName";

import ExpenseDashboard from "./ExpenseDashboard";
import DataInsertModal from "../../component/common/DataInsertModal";
import DataEditModal from "../../component/common/DataEditModal";
import DeleteAllModal from "../../component/common/DeleteAllModal";
import DropdownTap from "../../component/common/DropdownTap";
import PageInfo from "../../component/common/PageInfo";
import SelectedItemsCounter from "../../component/common/SelectedItemsCounter";
import Setting from "./Setting";
import AlertModal from "../../component/common/modal/AlertModal";
import IncomeManager from "./IncomeManger";

import { Fragment, useState, useEffect, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useNavigate, useLocation } from "react-router-dom";

function ExpenseManager() {
  const sortByDate = useSortByDate();

  const currentDate = new Date();
  const formattedMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const isMounted = useRef(false);

  const { ipcRenderer } = window.require("electron");

  const [activeIndex, setActiveIndex] = useState(0);

  const [date, setDate] = useState(formattedMonth);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const [expenseData, setExpenseData] = useState([]);
  const [isDataInsert, setDataInsert] = useState(false);

  const [isEditBtn, setEditBtn] = useState(false);
  const [editIndex, setEditindex] = useState(-1);

  const [navbarActiveIndex, setNavbarActiveIndex] = useState(0);

  const [isDeleteBtnClick, setDeleteBtnClick] = useState(false);

  const [incomeData, setIncomeData] = useState([]);

  const [isAllChecked, setAllChecked] = useState(false);

  const [taps, setTaps] = useState(["Overview"]);

  const [viewMode, setViewMode] = useState("table");

  const [isFilterOn, setFilterOn] = useState(false);

  const [isAlertModal, setAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const monthName = useMonthName(month);

  const storeName = localStorage.getItem("storeName");

  const [isIncomeView, setIncomeView] = useState("Expense");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (animate) {
      // 애니메이션 후에 클래스를 제거하기 위한 타이머
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 600); // 애니메이션 시간과 일치
      return () => clearTimeout(timer);
    }
  }, [animate, isIncomeView]);

  const handleIncomeView = (type) => () => {
    setAnimate(true); // 버튼 클릭 시 애니메이션 활성화
    // setIncomeView((prev) => (prev === "Expense" ? "Income" : "Expense"));
    if (type === "Expense") return setIncomeView("Expense");
    setIncomeView("Income");
  };

  const handleFilter = () => {
    if (filteredData.length === 0 && !isFilterOn) {
      setAlertModal(true);
      setAlertMessage("No data!");
      return;
    }

    handleFilterReset();
    handleTableReset();
    setFilterOn((state) => !state);
  };

  const handleFilterReset = () => {
    setFilterCategory("All");
    setMinAmount("");
    setMaxAmount("");
    setStartDate("");
    setEndDate("");
  };

  const handleTableReset = () => {
    setCurrentPage(1);
    setCurrentGroup(1);
    setCheckedItems({});
    setIsTableHeadChecked(false);
  };

  const handleAllChecked = () => {
    setAllChecked((state) => !state);
  };

  const tableRef = useRef(null);
  const scrollToTableTop = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (tableRef.current) {
      tableRef.current.scrollIntoView();
    }
  };

  useEffect(() => {
    if (isAllChecked) {
      setActiveIndex(0);
      setMonth("All");
      return;
    }

    const parts = date.split("-");
    setYear(Number(parts[0]));
    setMonth(parts[1]);
  }, [isAllChecked, date]);

  const navigate = useNavigate();
  const location = useLocation();

  const handleExpenseDate = (e) => {
    setAllChecked(false);
    setDate(e.target.value);
  };

  // const handleNavigate = () => {
  //   navigate("/income", {
  //     state: { value: expenseData, incomeData: incomeData },
  //   });
  // };

  const handleFromTap = (index) => () => {
    setActiveIndex(index);
    sortByDate(expenseData, "on", setExpenseData);
  };

  const handleDataInsert = () => {
    setDataInsert(true);
  };

  const handleEditBtn = (id) => () => {
    setEditBtn(true);
    setEditindex(id);
  };

  // Check Local Storage
  useEffect(() => {
    const loadedTaps = localStorage.getItem("taps");
    if (loadedTaps) {
      setTaps(JSON.parse(loadedTaps));
    }

    if (localStorage.getItem("tax")) setTaxOn(true);
  }, []);

  const handleNavbarBtn = (index, name) => () => {
    setNavbarActiveIndex(index);

    switch (name) {
      case "Dashboard":
        setViewMode("dashboard");
        break;
      case "Table":
        setViewMode("table");
        break;
      default:
        setViewMode("settings");
        break;
    }
  };

  const [filterCategory, setFilterCategory] = useState("All");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getFilteredData = () => {
    return expenseData.filter((item) => {
      // 기본 날짜 범위 조건 (사용자가 날짜 필터를 사용하지 않을 때 활성화)
      const matchDate =
        (item.month === month || month === "All") && item.year === year;

      const itemDate = new Date(
        item.year,
        Number(item.month) - 1,
        item.day || 1
      );
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate + "T23:59:59") : null;

      // 사용자가 날짜 필터를 설정했는지 여부에 따른 날짜 범위 조건 조정
      let matchDateRange = true;
      if (startDate || endDate) {
        // 사용자가 날짜 필터를 사용했을 경우, 해당 범위 내의 데이터만 필터링
        matchDateRange =
          (!start || itemDate >= start) && (!end || itemDate <= end);
      } else {
        // 사용자가 날짜 필터를 사용하지 않았을 경우, 기존의 month와 year 조건을 사용
        matchDateRange = matchDate;
      }

      // 다른 필터링 조건
      const matchType =
        taps[activeIndex] === item.from || taps[activeIndex] === "Overview";
      const matchAmountData = item.amount !== "";
      const matchCategory =
        filterCategory === "All" || item.category === filterCategory;
      const matchMinAmount =
        !minAmount || parseFloat(item.amount) >= parseFloat(minAmount);
      const matchMaxAmount =
        !maxAmount || parseFloat(item.amount) <= parseFloat(maxAmount);

      return (
        matchType &&
        matchAmountData &&
        matchCategory &&
        matchMinAmount &&
        matchMaxAmount &&
        matchDateRange
      );
    });
  };

  const filteredData = getFilteredData(); // 필터링된 데이터

  const handleTotalAmountCount = (type) => {
    if (type === "amount") {
      return filteredData
        .reduce((total, item) => total + item.amount || 0, 0)
        .toFixed(2);
    } else if (type === "count") {
      return filteredData.reduce((total, item) => total + 1, 0);
    } else if (type === "tax") {
      return filteredData
        .reduce((total, item) => total + item.tax || 0, 0)
        .toFixed(2);
    }
  };

  //* ITEM TOTAL AMOUNT FOR MAIN CONTENT *//
  const total = handleTotalAmountCount("amount");

  //* ITEM TOTAL TAX FOR MAIN CONTENT *//
  const totalTax = handleTotalAmountCount("tax");

  //* ITEM TOTAL COUNT FOR MAIN CONTENT *//
  const itemCount = handleTotalAmountCount("count");

  const [dataInitialized, setDataInitialized] = useState(false);
  const [fileId, setFileId] = useState("");

  //* SAVE DATA AS A JSON FILE *//
  const saveDataToFile = () => {
    ipcRenderer.send("save-data", { expenseData, incomeData });
  };

  // Shortcut for saving data
  useEffect(() => {
    ipcRenderer.on("trigger-save-data", saveDataToFile);

    return () => {
      ipcRenderer.removeAllListeners("trigger-save-data");
    };
    // eslint-disable-next-line
  }, [saveDataToFile]);

  useEffect(() => {
    const handleDataSaved = (event, data) => {
      if (data === "success") {
        setDataInitialized(true);
        // setFileId(Date());
      }
    };

    ipcRenderer.on("saved-data", handleDataSaved);

    return () => {
      ipcRenderer.removeListener("saved-data", handleDataSaved);
    };
    // eslint-disable-next-line
  }, []);

  const loadDataFromFile = () => {
    ipcRenderer.send("load-data");
  };

  useEffect(() => {
    ipcRenderer.on("trigger-load-data", loadDataFromFile);

    return () => {
      ipcRenderer.removeAllListeners("trigger-load-data");
    };
    // eslint-disable-next-line
  }, [loadDataFromFile]);

  useEffect(() => {
    const handleDataLoad = (event, data) => {
      if (data) {
        const { expenseData, incomeData } = data;

        // console.log(URLIncomeData);

        // const monthNamesToNumbers = {
        //   January: "01",
        //   February: "02",
        //   March: "03",
        //   April: "04",
        //   May: "05",
        //   June: "06",
        //   July: "07",
        //   August: "08",
        //   September: "09",
        //   October: "10",
        //   November: "11",
        //   December: "12",
        // };

        // const convertedData = expenseData.map((item) => {
        //   const monthNumber = monthNamesToNumbers[item.month];
        //   if (monthNumber) {
        //     return { ...item, month: monthNumber };
        //   }
        //   return item;
        // });

        // setExpenseData(convertedData);

        // const transformedData = expenseData.map(
        //   ({ type, sort, categoryData, amountData, ...rest }) => ({
        //     ...rest, // 기존의 다른 필드들은 그대로 유지
        //     from: type, // 'type' 필드를 'from'으로 변경
        //     category: sort, // 'sort' 필드를 'category'로 변경
        //     item: categoryData, // 'categoryData'를 'item'으로 변경
        //     amount: amountData, // 'amountData'를 'amount'으로 변경
        //   })
        // );

        sortByDate(expenseData, "on", setExpenseData);
        setIncomeData(incomeData);
        setDataInitialized(true);
        setFileId(Date());
      }
    };

    ipcRenderer.on("loaded-data", handleDataLoad);

    return () => {
      ipcRenderer.removeListener("loaded-data", handleDataLoad);
    };
    // eslint-disable-next-line
  }, []);

  /**
   * Save data as a excel file
   */
  const exportDataAsExcel = () => {
    if (expenseData.length === 0 && incomeData.length === 0) {
      ipcRenderer.send(
        "show-warning-dialog",
        "No data to export! (데이터가 존재하지 않습니다.)"
      );
      return;
    }

    sortByDate(expenseData, "off", setExpenseData);

    const combinedData = {
      expenseData: expenseData.length > 0 ? expenseData : null,
      incomeData: incomeData.length > 0 ? incomeData : null,
    };

    ipcRenderer.send("export-data-to-excel", combinedData);
  };

  /**
   * Improt data based on a excel file
   */
  const selectExcelFile = () => {
    ipcRenderer.send("open-file-dialog-for-excel");
  };

  useEffect(() => {
    ipcRenderer.on("excel-data", (event, expenseData, incomeData) => {
      if (expenseData && expenseData.length > 0) {
        sortByDate(expenseData, "on", setExpenseData);
      }

      if (incomeData && incomeData.length > 0) {
        setIncomeData(incomeData);
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    return () => {
      ipcRenderer.removeAllListeners("excel-data");
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const { ipcRenderer } = window.require("electron");

    ipcRenderer.on("activate-insert", () => {
      setDataInsert(true);
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      ipcRenderer.removeAllListeners("activate-insert");
    };
  }, []);

  //* SEARCH ITEM *//
  // const filteredSearch = useMemo(() => {
  //   return expenseData.filter(
  //     (p) =>
  //       p.categoryData
  //         .replace(" ", "")
  //         .toLocaleLowerCase()
  //         .includes(searchInput.replace(" ", "").toLocaleLowerCase()) ||
  //       p.sort
  //         .replace(" ", "")
  //         .toLocaleLowerCase()
  //         .includes(searchInput.replace(" ", "").toLocaleLowerCase()) ||
  //       p.type
  //         .replace(" ", "")
  //         .toLocaleLowerCase()
  //         .includes(searchInput.replace(" ", "").toLocaleLowerCase())
  //   );
  // }, [searchInput, expenseData]);

  // //* SEARCH ITEM TOTAL AMOUNT *//
  // const filteredSearchTotal = handleTotalAmountCount(
  //   filteredSearch,
  //   "amount",
  //   "yes"
  // );

  // //* SEARCH ITEM TOTAL COUNT *//
  // const filteredSearchTotalCount = handleTotalAmountCount(
  //   filteredSearch,
  //   "count",
  //   "yes"
  // );

  // useEffect(() => {
  //   if (location.state) {
  //     const expenseInfo = location.state.value;
  //     const incomeData = location.state.incomeData;

  //     if (expenseInfo.length > 0) {
  //       setExpenseData(expenseInfo);
  //     }

  //     if (incomeData.length > 0) {
  //       setIncomeData(incomeData);
  //     }
  //   }
  // }, [location.state]);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentGroup, setCurrentGroup] = useState(1);
  const itemsPerPage = 20;
  const pagesPerGroup = 10; // 한 그룹당 표시할 페이지 수

  // 페이지네이션을 위한 계산
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const totalGroups = Math.ceil(totalPages / pagesPerGroup);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // 현재 그룹에서 표시할 페이지 번호들 계산
  const startPage = (currentGroup - 1) * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // 페이지 그룹 이동 핸들러
  const handlePrevGroup = () => {
    const newGroup = Math.max(currentGroup - 1, 1);
    setCurrentGroup(newGroup);
    setCurrentPage((newGroup - 1) * pagesPerGroup + 1);
  };

  const handleNextGroup = () => {
    const newGroup = Math.min(currentGroup + 1, totalGroups);
    setCurrentGroup(newGroup);
    setCurrentPage((newGroup - 1) * pagesPerGroup + 1);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
    setCurrentGroup(1); // 첫 번째 그룹으로 설정
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
    setCurrentGroup(totalGroups); // 마지막 그룹으로 설정
  };

  const [checkedItems, setCheckedItems] = useState({});
  const [isTableHeadChecked, setIsTableHeadChecked] = useState(false);
  const [disableTableChecked, setDisableTableCheck] = useState(false);

  // 체크박스 토글 핸들러
  const handleCheck = (id) => {
    setCheckedItems((prevItems) => {
      // 현재 상태의 반대 값을 계산합니다.
      const isChecked = !prevItems[id];

      // 새로운 상태를 생성합니다.
      const updatedItems = { ...prevItems, [id]: isChecked };

      // 만약 해당 항목이 false라면, 객체에서 해당 키를 제거합니다.
      if (!isChecked) {
        delete updatedItems[id];
      }

      return updatedItems;
    });
  };

  // 전체 선택/해제 핸들러
  const handleAllCheck = (e) => {
    const newChecked = { ...checkedItems };

    if (e.target.checked) {
      currentItems.forEach((item) => {
        newChecked[item.id] = true;
      });
    } else {
      currentItems.forEach((item) => {
        delete newChecked[item.id];
      });
    }

    setCheckedItems(newChecked);
    // 전체 선택이 아닌 경우에도 상태 업데이트
    setIsTableHeadChecked(e.target.checked);
  };

  useEffect(() => {
    if (isMounted.current) {
      handleTableReset();
      setFilterOn(false);
      handleFilterReset();
    } else {
      // 첫 마운트 시에는 이 블록이 실행되고, 그 후 isMounted.current 값을 true로 설정
      isMounted.current = true;
    }
  }, [month, year, taps, activeIndex]);

  useEffect(() => {
    if (isMounted.current) {
      handleTableReset();
    }
  }, [filterCategory, minAmount, maxAmount, startDate, endDate]);

  useEffect(() => {
    if (isMounted.current) {
      if (currentItems.length === 0) {
        setIsTableHeadChecked(false);
        setDisableTableCheck(true);
        return;
      }

      setDisableTableCheck(false);

      const allItemsChecked = currentItems.every(
        (item) => checkedItems[item.id]
      );
      setIsTableHeadChecked(allItemsChecked);
    }
  }, [currentItems, checkedItems]);

  useAutoSaveData(expenseData, incomeData);

  const [taxOn, setTaxOn] = useState(false);

  const handleSettingTax = (command) => () => {
    if (command === "on") {
      setTaxOn(true);
      localStorage.setItem("tax", "on");
      return;
    }
    setTaxOn(false);
    localStorage.removeItem("tax");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isDataInsert) {
          setDataInsert(false); // 데이터 삽입 모달을 닫습니다.
        }
        if (isEditBtn) {
          setEditBtn(false); // 데이터 편집 모달을 닫습니다.
        }
      }
    };

    if (isDataInsert || isEditBtn) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDataInsert, isEditBtn]);

  return (
    <>
      <div className="app">
        {Object.keys(checkedItems).length > 0 && (
          <SelectedItemsCounter
            length={Object.keys(checkedItems).length}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            expenseData={expenseData}
            setExpenseData={setExpenseData}
          />
        )}

        {/* Save and Load Button */}
        <section className="app-save-load-container">
          <button onClick={saveDataToFile} className="save-load-btn">
            Save Data (저장)
            <FontAwesomeIcon
              icon="fa-solid fa-upload"
              style={{ marginLeft: "5px" }}
            />
          </button>

          {/* <button onClick={handleNavigate} className="income-navigate-button">
            Income Manager
          </button> */}

          <button onClick={loadDataFromFile} className="save-load-btn">
            Load Data (불러오기)
            <FontAwesomeIcon
              icon="fa-solid fa-download"
              style={{ marginLeft: "5px" }}
            />
          </button>
        </section>

        {/* Main Header */}
        <section className="app-main-header">
          <h1 className="header">
            Money Insight{" "}
            <FontAwesomeIcon icon="fa-solid fa-money-check-dollar" />
          </h1>
          <h3 className="sub-header">{storeName}</h3>
        </section>

        {/* Viewmode Navbar */}
        <section className="app-navbar-container">
          {navbarList.map((content, index) => {
            return (
              <button
                className={`navbar-btn ${
                  navbarActiveIndex === index ? "navbar-btn-active" : null
                }`}
                onClick={handleNavbarBtn(index, content.name)}
                key={index}
              >
                {content.name}
                {content.icon}
              </button>
            );
          })}
        </section>

        {/* Switch Expense Manager and Income Manager */}
        {viewMode !== "settings" && (
          <section className="app-income-expense-switch">
            {/* <h1
              className={`${animate ? "flip-animation" : ""} ${
                isIncomeView === "Expense" ? "expense" : "income"
              }`}
            >
              {isIncomeView} Manager
            </h1>
            <h1
              className={`${animate ? "flip-animation" : ""} ${
                isIncomeView === "Expense" ? "expense" : "income"
              }`}
            >
              {isIncomeView} Manager
            </h1> */}

            <h1
              onClick={handleIncomeView("Expense")}
              className={` ${isIncomeView === "Expense" && "expense"}`}
            >
              Expense <FontAwesomeIcon icon="fa-solid fa-money-check-dollar" />
            </h1>

            <h1
              onClick={handleIncomeView("Income")}
              className={` ${isIncomeView === "Income" && "income"}`}
            >
              Income <FontAwesomeIcon icon="fa-solid fa-money-bill-trend-up" />
            </h1>
            {/* <button
              onClick={handleIncomeView}
              className={animate ? "flip-animation" : ""}
            >
              <FontAwesomeIcon icon="fa-solid fa-repeat" />
            </button> */}
          </section>
        )}

        {/* Select Date (Month and Year) */}
        {viewMode !== "settings" && (
          <section className="app-month-year">
            <input
              type="month"
              className="app-month"
              onChange={handleExpenseDate}
              value={date}
            ></input>

            <label className="switch">
              <input
                type="checkbox"
                id="all"
                name="all"
                checked={isAllChecked}
                onChange={handleAllChecked}
              />
              <span className="slider"></span>
            </label>
            <label htmlFor="all" className="all-label">
              {year} All (전체)
            </label>
          </section>
        )}

        {/* Viewmode = table */}
        {viewMode === "table" && isIncomeView === "Expense" && (
          <div className="table-content-container animation">
            <div className="main-container">
              <h2 className="main-header">
                <span className="main-year">{year} </span>{" "}
                {month === "All" ? "All" : monthName}
              </h2>

              <h2 className="main-sub-header">
                {month === "All" ? "" : `(${Number(month)}월)`}
              </h2>

              <section className="top-tap-container">
                <DropdownTap
                  taps={taps}
                  handleFromTap={handleFromTap}
                  activeIndex={activeIndex}
                />
              </section>

              {totalPages > 0 && (
                <div className="item-total-count-container">
                  <h3 className="item-count item-count-top">
                    {itemCount} items
                  </h3>
                  <h3 className="item-total item-total-top">
                    Total: <span style={{ marginRight: "3px" }}>$</span>
                    {parseFloat(total).toLocaleString("en-US")}
                  </h3>
                </div>
              )}

              <div className="item-search-filter-container">
                <input type="search" placeholder="🔍 Search.."></input>
                <button
                  onClick={handleFilter}
                  className={`item-filter-button ${
                    isFilterOn ? "filter-active" : null
                  }`}
                >
                  Filter
                </button>
              </div>

              {isFilterOn && (
                <div className="filters-container">
                  <form className="filters animation-x">
                    <div className="filters-input-container">
                      <label htmlFor="filter-category">Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        id="filter-category"
                      >
                        <option value="All">모든 카테고리</option>
                        {foodSortList.map((item, index) => {
                          return (
                            <option value={item.name} key={index}>
                              {item.name}
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
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                      />
                    </div>

                    <div className="filters-input-container">
                      <label>Maximum Amount</label>
                      <input
                        type="number"
                        placeholder="최대 금액"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                      />
                    </div>

                    <div className="filters-input-container">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="filters-input-container">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>

                    <div className="filters-input-container">
                      <label>Reset</label>
                      <button type="reset" onClick={handleFilterReset}>
                        Reset
                      </button>
                    </div>
                  </form>

                  <center className="animation-x">
                    <button className="filters-close" onClick={handleFilter}>
                      CLOSE
                    </button>
                  </center>
                </div>
              )}

              <table ref={tableRef}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleAllCheck}
                        checked={isTableHeadChecked}
                        disabled={disableTableChecked}
                      />
                    </th>
                    <th>#</th>
                    <th>Date</th>
                    <th>From</th>
                    <th>Category</th>
                    <th>Name</th>
                    {taxOn && <th>Tax</th>}
                    <th>Amount</th>
                    <th>Edit</th>
                  </tr>
                </thead>

                {currentItems.map((content, index) => {
                  const itemNumber =
                    (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <Fragment key={index}>
                      <>
                        <tbody>
                          <tr>
                            <td>
                              <input
                                type="checkbox"
                                checked={!!checkedItems[content.id]}
                                onChange={() => handleCheck(content.id)}
                              />
                            </td>
                            <td>{itemNumber}</td>
                            <td>{content.date}</td>
                            <td>{content.from}</td>
                            <td>{content.category}</td>
                            <td>{content.item}</td>
                            {taxOn && (
                              <td>
                                <span style={{ marginRight: "4px" }}>$</span>
                                {parseFloat(content.tax).toLocaleString(
                                  "en-US",
                                  {
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </td>
                            )}

                            <td className="amount-red">
                              <span style={{ marginRight: "4px" }}>$</span>
                              {parseFloat(content.amount).toLocaleString(
                                "en-US",
                                {
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </td>
                            <td>
                              <button
                                onClick={handleEditBtn(content.id)}
                                className="item-edit-btn"
                              >
                                EDIT
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </>
                    </Fragment>
                  );
                })}
              </table>

              <div className="pagination">
                <button
                  onClick={handleFirstPage}
                  className="pagination-first-last-button"
                  disabled={currentPage === 1}
                >
                  |&lt;
                </button>
                <button
                  onClick={handlePrevGroup}
                  className="pagination-group-button"
                  disabled={currentGroup === 1}
                >
                  &lt;
                </button>
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => scrollToTableTop(number)}
                    className={`pagination-number-button ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={handleNextGroup}
                  className="pagination-group-button"
                  disabled={currentGroup === totalGroups || totalPages < 1}
                >
                  &gt;
                </button>
                <button
                  onClick={handleLastPage}
                  className="pagination-first-last-button"
                  disabled={currentPage === totalPages || totalPages < 1}
                >
                  &gt;|
                </button>
              </div>

              <PageInfo totalPages={totalPages} currentPage={currentPage} />

              <div className="item-total-container">
                <div className="item-total-count-container">
                  <h3 className="item-count item-count-bottom">
                    {itemCount} items
                  </h3>
                  {taxOn && (
                    <h2 className="item-total item-total-tax">
                      Total Tax: <span style={{ marginRight: "5px" }}>$</span>
                      {parseFloat(totalTax).toLocaleString("en-US")}
                    </h2>
                  )}
                  <h2 className="item-total">
                    Total Amount: <span style={{ marginRight: "5px" }}>$</span>
                    {parseFloat(total).toLocaleString("en-US")}
                  </h2>
                </div>
              </div>

              <section className="item-export-btn-container">
                <button onClick={selectExcelFile} className="item-export-btn">
                  Import Excel file (엑셀을 불러오기)
                  <FontAwesomeIcon
                    icon="fa-solid fa-file-import"
                    style={{ marginLeft: "7px" }}
                    size="lg"
                  />
                </button>

                <button onClick={exportDataAsExcel} className="item-export-btn">
                  Export to Excel (엑셀로 내보내기)
                  <FontAwesomeIcon
                    icon="fa-solid fa-file-export"
                    style={{ marginLeft: "7px" }}
                    size="lg"
                  />
                </button>
              </section>
            </div>
          </div>
        )}

        {viewMode === "table" && isIncomeView === "Income" && (
          <IncomeManager incomeData={incomeData} />
        )}

        {/* Viewmode = settings */}
        {viewMode === "settings" && (
          <Setting
            taps={taps}
            setTaps={setTaps}
            taxOn={taxOn}
            handleSettingTax={handleSettingTax}
            expenseDataLength={expenseData.length}
            setDeleteBtnClick={setDeleteBtnClick}
          />
        )}

        {/* Viewmode = dashboard */}
        {viewMode === "dashboard" && (
          <ExpenseDashboard
            expenseData={expenseData}
            selectedYear={year.toString()}
            selectedMonth={month}
            itemCount={itemCount}
            total={total}
            isIncomeView={isIncomeView}
          />
        )}
      </div>

      {/* Data Insert Modal */}
      {isDataInsert && (
        <DataInsertModal
          setDataInsert={setDataInsert}
          activeIndex={activeIndex}
          date={date}
          year={year}
          month={month}
          expenseData={expenseData}
          setExpenseData={setExpenseData}
          taps={taps}
          taxOn={taxOn}
        />
      )}

      {/* Data Edit Modal */}
      {isEditBtn && (
        <DataEditModal
          setEditBtn={setEditBtn}
          editIndex={editIndex}
          setExpenseData={setExpenseData}
          expenseData={expenseData}
          taps={taps}
          taxOn={taxOn}
        />
      )}

      {/* Delete All Data Modal */}
      {isDeleteBtnClick && (
        <DeleteAllModal
          setDeleteBtnClick={setDeleteBtnClick}
          expenseData={expenseData}
          setExpenseData={setExpenseData}
        />
      )}

      {isAlertModal && (
        <AlertModal setAlertModal={setAlertModal} message={alertMessage} />
      )}

      {/* DATA INSERT BUTTON */}
      <button
        className={`item-insert-button ${
          viewMode === "settings" || viewMode === "dashboard" ? "invisible" : ""
        }`}
        onClick={handleDataInsert}
      >
        +
      </button>
    </>
  );
}

export default ExpenseManager;
