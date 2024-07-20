import "./ExpenseManager.css";

// Custom Hook
import { useSortByDate } from "../../component/common/useSortByDate";
import { useSortStrings } from "../../component/common/useSortStrings";
import { useSortNumbers } from "../../component/common/useSortNumber";
import useAutoSaveData from "../../component/common/useAutoSaveData";
import useMonthName from "../../component/common/useMonthName";

// Recoil
import { useRecoilState } from "recoil";
import {
  tapsState,
  expenseCategoryTabsState,
  expenseDataState,
  incomeDataState,
  incomeHeadersState,
} from "../../recoil/store";

import IncomeManager from "./IncomeManger";
import ExpenseDashboard from "./ExpenseDashboard";
import HeaderDisplay from "./component/HeaderDisplay";
import SearchAndFilter from "./component/SearchAndFilter";

// Modals
import DataInsertModal from "../../component/common/DataInsertModal";
import DataEditModal from "../../component/common/DataEditModal";
import DeleteAllModal from "../../component/common/DeleteAllModal";
import AlertModal from "../../component/common/modal/AlertModal";
import RequestPasswordForFileLoad from "../../component/common/modal/RequestPasswordForFileLoad";
import DropdownTap from "../../component/common/DropdownTap";

// Components
import Navbar from "./component/Navbar";
import Setting from "./component/Setting";
import DateSelector from "./component/DataSelector";
import SwitchManagers from "./component/SwitchManagers";
import PageInfo from "./component/PageInfo";
import SelectedItemsCounter from "./component/SelectedItemsCounter";

// Libraries
import {
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const { ipcRenderer } = window.require("electron");

function ExpenseManager() {
  const isMounted = useRef(false);

  const storeName = localStorage.getItem("storeName");
  const currentDate = new Date();
  const formattedMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const [expenseData, setExpenseData] = useRecoilState(expenseDataState);
  const [incomeData, setIncomeData] = useRecoilState(incomeDataState);

  const [taps, setTaps] = useRecoilState(tapsState);
  const [expenseCategoryTabs, setExpenseCategoryTabs] = useRecoilState(
    expenseCategoryTabsState
  );

  const [incomeHeaders, setIncomeHeaders] = useRecoilState(incomeHeadersState);

  const [activeIndex, setActiveIndex] = useState(0);

  const [date, setDate] = useState(formattedMonth);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const [isFilterOn, setFilterOn] = useState(false);
  const [filters, setFilters] = useState({
    filterCategory: "All",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

  const updateFilter = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const [isDataInsert, setDataInsert] = useState(false);
  const [isEditBtn, setEditBtn] = useState(false);
  const [editIndex, setEditindex] = useState(-1);
  const [isDeleteBtnClick, setDeleteBtnClick] = useState(false);

  const [isMonthAllChecked, setMonthAllChecked] = useState(false);

  const [viewMode, setViewMode] = useState("Table");
  const [isIncomeView, setIncomeView] = useState("Expense");

  const [taxOn, setTaxOn] = useState(() => {
    const taxStored = localStorage.getItem("tax");
    return !!taxStored;
  });

  const [isAlertModal, setAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState("");

  const monthName = useMonthName(month);
  const sortByDate = useSortByDate();
  const sortStrings = useSortStrings();
  const sortNumbers = useSortNumbers();

  const handleFilter = () => {
    if (filteredData.length === 0 && !isFilterOn) {
      setAlertModal(true);
      setAlertMessage("No data!");
      return;
    }

    filterReset();
    tablePageReset();
    setFilterOn((state) => !state);
  };

  const filterReset = () => {
    setFilters({
      filterCategory: "All",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
    });
  };

  const tablePageReset = () => {
    setCurrentPage(1);
    setCurrentGroup(1);
    setCheckedItems({});
    setIsTableHeadChecked(false);
  };

  const handleMonthAllChecked = () => {
    setMonthAllChecked((state) => !state);
  };

  useEffect(() => {
    if (isMonthAllChecked) {
      setActiveIndex(0);
      setMonth("All");
      return;
    }
    const parts = date.split("-");
    setYear(Number(parts[0]));
    setMonth(parts[1]);
  }, [isMonthAllChecked, date]);

  const tableRef = useRef(null);
  const scrollToTableTop = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (tableRef.current) {
      tableRef.current.scrollIntoView();
    }
  };

  const handleExpenseDate = (e) => {
    setMonthAllChecked(false);
    setDate(e.target.value);
  };

  const handleFromTap = (index) => () => {
    setActiveIndex(index);
  };

  const handleEditBtn = (id) => () => {
    setEditBtn(true);
    setEditindex(id);
  };

  const handleNavbarBtn = (name) => () => {
    switch (name) {
      case "Dashboard":
        setViewMode("Dashboard");
        break;
      case "Table":
        setViewMode("Table");
        break;
      default:
        setViewMode("Setting");
        break;
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    // 검색어가 있는 경우 검색어 조건으로만 필터링
    if (debouncedSearchQuery) {
      return expenseData.filter((item) => {
        const normalizedSearchQuery = debouncedSearchQuery
          .toLowerCase()
          .replace(/\s+/g, "");
        return (
          item.from
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(normalizedSearchQuery) ||
          item.category
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(normalizedSearchQuery) ||
          item.item
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(normalizedSearchQuery)
        );
      });
    }

    // 검색어가 없는 경우 기존의 필터링 조건 사용
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate
      ? new Date(filters.endDate + "T23:59:59")
      : null;

    return expenseData.filter((item) => {
      const itemDate = new Date(
        item.year,
        Number(item.month) - 1,
        item.day || 1
      );

      // 기본 날짜 범위 조건
      const matchDate =
        (item.month === month || month === "All") && item.year === year;
      let matchDateRange = matchDate;

      // 사용자가 날짜 필터를 설정한 경우 조정된 날짜 범위 조건
      if (filters.startDate || filters.endDate) {
        matchDateRange =
          (!start || itemDate >= start) && (!end || itemDate <= end);
      }

      // 다른 필터링 조건
      const matchType =
        taps[activeIndex] === item.from || taps[activeIndex] === "Overview";
      const matchCategory =
        filters.filterCategory === "All" ||
        filters.filterCategory === item.category;
      const matchMinAmount =
        !filters.minAmount ||
        parseFloat(item.amount) >= parseFloat(filters.minAmount);
      const matchMaxAmount =
        !filters.maxAmount ||
        parseFloat(item.amount) <= parseFloat(filters.maxAmount);
      const matchAmountData = item.amount !== "";

      return (
        matchType &&
        matchAmountData &&
        matchCategory &&
        matchMinAmount &&
        matchMaxAmount &&
        matchDateRange
      );
    });
  }, [
    expenseData,
    month,
    year,
    filters.startDate,
    filters.endDate,
    taps,
    activeIndex,
    filters.filterCategory,
    filters.minAmount,
    filters.maxAmount,
    debouncedSearchQuery,
  ]);

  const calculateTotals = useMemo(() => {
    const totals = { amount: 0, count: 0, tax: 0 };

    filteredData.forEach((item) => {
      totals.amount += item.amount || 0;
      totals.tax += item.tax || 0;
      totals.count += 1;
    });

    // 숫자를 문자열로 변환하고 소수점 두 자리로 고정
    totals.amount = totals.amount.toFixed(2);
    totals.tax = totals.tax.toFixed(2);

    return totals;
  }, [filteredData]);

  //* ITEM TOTAL AMOUNT FOR MAIN CONTENT *//
  const total = calculateTotals.amount;
  //* ITEM TOTAL TAX FOR MAIN CONTENT *//
  const totalTax = calculateTotals.tax;
  //* ITEM TOTAL COUNT FOR MAIN CONTENT *//
  const itemCount = calculateTotals.count;

  // const [dataInitialized, setDataInitialized] = useState(false);
  // const [fileId, setFileId] = useState("");

  //* SAVE DATA AS A JSON FILE *//
  const saveDataToFile = useCallback(() => {
    const storedPassword = localStorage.getItem("encryptedPassword") || "";
    const storedSQ1 = localStorage.getItem("encryptedSecurityQuestion1") || "";
    const storedSQ2 = localStorage.getItem("encryptedSecurityQuestion2") || "";
    const taps = localStorage.getItem("taps") || "";
    const expenseCategoryTabs =
      localStorage.getItem("expenseCategoryTabs") || "";
    const incomeHeaders = localStorage.getItem("incomeHeaders") || "";

    ipcRenderer.send("save-data", {
      expenseData,
      incomeData,
      storedPassword,
      storedSQ1,
      storedSQ2,
      taps,
      expenseCategoryTabs,
      incomeHeaders,
    });
  }, [expenseData, incomeData]);

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
        // setDataInitialized(true);
        // setFileId(Date());
      }
    };

    ipcRenderer.on("saved-data", handleDataSaved);

    return () => {
      ipcRenderer.removeListener("saved-data", handleDataSaved);
    };
    // eslint-disable-next-line
  }, []);

  // Memoized callback for file loading
  const loadDataFromFile = useCallback(() => {
    ipcRenderer.send("load-data-request");
  }, []);

  useEffect(() => {
    ipcRenderer.on("request-password", (event, filePath) => {
      setSelectedFilePath(filePath);
      setShowPasswordModal(true);
    });

    return () => {
      ipcRenderer.removeAllListeners("request-password");
    };
    // eslint-disable-next-line
  }, []);

  const handlePasswordSubmit = (password) => {
    ipcRenderer.send("verify-password-and-load", {
      password,
      filePath: selectedFilePath,
    });
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
      setShowPasswordModal(false);

      if (data) {
        const {
          expenseData,
          incomeData,
          // storedPassword,
          // storedSQ1,
          // storedSQ2,
          taps,
          expenseCategoryTabs,
          incomeHeaders,
        } = data;

        if (taps) {
          localStorage.setItem("taps", taps);
          setTaps(JSON.parse(taps));
        }

        if (expenseCategoryTabs) {
          localStorage.setItem("expenseCategoryTabs", expenseCategoryTabs);
          setExpenseCategoryTabs(JSON.parse(expenseCategoryTabs));
        }

        if (incomeHeaders) {
          localStorage.setItem("incomeHeaders", incomeHeaders);
          setIncomeHeaders(JSON.parse(incomeHeaders));
        }

        sortByDate(expenseData, setExpenseData, "ascending");
        setIncomeData(incomeData);

        // setDataInitialized(true);
        // setFileId(Date());
      }
    };

    ipcRenderer.on("loaded-data", handleDataLoad);

    return () => {
      ipcRenderer.removeListener("loaded-data", handleDataLoad);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleError = (event, errorMessage) => {
      setAlertMessage("Password does not match");
      setAlertModal(true);
    };

    ipcRenderer.on("load-error", handleError);

    return () => {
      ipcRenderer.removeListener("load-error", handleError);
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

    sortByDate(expenseData, setExpenseData, "ascending");

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
        sortByDate(expenseData, setExpenseData, "ascending");
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

  const [currentPage, setCurrentPage] = useState(1);
  const [currentGroup, setCurrentGroup] = useState(1);
  const itemsPerPage = 10;
  const pagesPerGroup = 10; // 한 그룹당 표시할 페이지 수

  const [newDataID, setNewDataID] = useState(-1);

  useEffect(() => {
    const newDataIndex = filteredData.findIndex(
      (item) => item.id === newDataID
    );

    const newPageNumber = Math.ceil((newDataIndex + 1) / itemsPerPage);
    setCurrentPage(newPageNumber);
    // eslint-disable-next-line
  }, [newDataID]);

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
      tablePageReset();
      setFilterOn(false);
      filterReset();
    } else {
      // 첫 마운트 시에는 이 블록이 실행되고, 그 후 isMounted.current 값을 true로 설정
      isMounted.current = true;
    }
  }, [month, year, taps, activeIndex, viewMode, isIncomeView]);

  useEffect(() => {
    if (isMounted.current) {
      tablePageReset();
    }
  }, [
    filters.filterCategory,
    filters.minAmount,
    filters.maxAmount,
    filters.startDate,
    filters.endDate,
  ]);

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

  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "ascending",
    type: "date",
  });

  const handleSort = (key, type) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction, type });
  };

  const tableHeaders = [
    { key: "date", label: "Date", type: "date" },
    { key: "from", label: "From", type: "string" },
    { key: "category", label: "Category", type: "string" },
    { key: "item", label: "Item", type: "string" },
    ...(taxOn ? [{ key: "tax", label: "Tax", type: "number" }] : []),
    { key: "amount", label: "Amount", type: "number" },
  ];

  useEffect(() => {
    if (sortConfig.type === "date") {
      sortByDate(expenseData, setExpenseData, sortConfig.direction);
    } else if (sortConfig.type === "string") {
      sortStrings(
        expenseData,
        setExpenseData,
        sortConfig.direction,
        sortConfig.key
      );
    } else if (sortConfig.type === "number") {
      sortNumbers(
        expenseData,
        setExpenseData,
        sortConfig.direction,
        sortConfig.key
      );
    }
    // eslint-disable-next-line
  }, [sortConfig]);

  useEffect(() => {
    setDebouncedSearchQuery("");
    setSearchQuery("");
  }, [viewMode, isIncomeView]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 300ms 지연

    tablePageReset();

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const isSearching = !!debouncedSearchQuery; // 검색 중인지 여부 판단

  return (
    <>
      <div className="app">
        {/* Show Selected Items */}
        {Object.keys(checkedItems).length > 0 && (
          <SelectedItemsCounter
            length={Object.keys(checkedItems).length}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
            expenseOrIncome="expense"
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
          <h1 className="header">Money Insight</h1>
          <h1 className="sub-header">{storeName}</h1>
        </section>

        <SwitchManagers
          setIncomeView={setIncomeView}
          isIncomeView={isIncomeView}
        />

        <Navbar
          viewMode={viewMode}
          handleNavbarBtn={handleNavbarBtn}
          isIncomeView={isIncomeView}
        />

        {/* Switch Managers, Date Selector, Data Insert */}
        {viewMode !== "Setting" && (
          <>
            <div className={`${isSearching ? "hidden" : "visible"}`}>
              <DateSelector
                handleExpenseDate={handleExpenseDate}
                date={date}
                isMonthAllChecked={isMonthAllChecked}
                handleMonthAllChecked={handleMonthAllChecked}
              />
            </div>

            <button
              className="item-insert-button"
              onClick={() => setDataInsert(true)}
            >
              +
            </button>
          </>
        )}

        {/* Viewmode = table */}
        {viewMode === "Table" && isIncomeView === "Expense" && (
          <div className="table-content-container animation">
            <div className="main-container">
              <HeaderDisplay
                isSearching={isSearching}
                month={month}
                year={year}
                monthName={monthName}
              />

              <section
                className={`top-tap-container ${
                  isSearching ? "hidden" : "visible"
                }`}
              >
                <DropdownTap
                  handleFromTap={handleFromTap}
                  activeIndex={activeIndex}
                />

                <div className="item-total-count-container">
                  <h3 className="item-count item-count-top">
                    {itemCount} items
                  </h3>
                  <h3 className="item-total item-total-top">
                    Total:
                    <span style={{ color: "#c6634a" }}>
                      <span style={{ marginRight: "3px" }}> $</span>
                      {parseFloat(total).toLocaleString("en-US")}
                    </span>
                  </h3>
                </div>
              </section>

              <SearchAndFilter
                isSearching={isSearching}
                setSearchQuery={setSearchQuery}
                handleFilter={handleFilter}
                isFilterOn={isFilterOn}
                filters={filters}
                updateFilter={updateFilter}
                filterReset={filterReset}
                expenseCategoryTabs={expenseCategoryTabs}
              />

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
                    <th># </th>
                    {tableHeaders.map(({ key, label, type }) => (
                      <th key={key} onClick={() => handleSort(key, type)}>
                        {label}{" "}
                        {sortConfig.key === key && (
                          <FontAwesomeIcon
                            icon={
                              sortConfig.direction === "ascending"
                                ? "fa-solid fa-arrow-up"
                                : "fa-solid fa-arrow-down"
                            }
                            style={{ width: "9px" }}
                          />
                        )}
                      </th>
                    ))}
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

              {currentItems.length > 0 && (
                <div className="item-total-container">
                  <div className="item-total-count-container">
                    <h3 className="item-count item-count-bottom">
                      {itemCount} items
                    </h3>
                    {taxOn && (
                      <h2 className="item-total item-total-tax">
                        Total Expense Tax:{" "}
                        <span style={{ marginRight: "5px" }}>$</span>
                        {parseFloat(totalTax).toLocaleString("en-US")}
                      </h2>
                    )}
                    <h2 className="item-total">
                      Total Amount:{" "}
                      <span style={{ color: "#c6634a" }}>
                        <span style={{ marginRight: "5px" }}>$</span>
                        {parseFloat(total).toLocaleString("en-US")}
                      </span>
                    </h2>
                  </div>
                </div>
              )}
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

        {viewMode === "Table" && isIncomeView === "Income" && (
          <IncomeManager year={year} month={month} />
        )}

        {/* Viewmode = settings */}
        {viewMode === "Setting" && (
          <Setting
            taxOn={taxOn}
            handleSettingTax={handleSettingTax}
            setDeleteBtnClick={setDeleteBtnClick}
          />
        )}

        {/* Viewmode = dashboard */}
        {viewMode === "Dashboard" && (
          <ExpenseDashboard
            selectedYear={year.toString()}
            selectedMonth={month}
            // itemCount={itemCount}
            // total={total}
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
          taxOn={taxOn}
          setNewDataID={setNewDataID}
        />
      )}

      {/* Data Edit Modal */}
      {isEditBtn && (
        <DataEditModal
          setEditBtn={setEditBtn}
          editIndex={editIndex}
          taxOn={taxOn}
        />
      )}

      {/* Delete All Data Modal */}
      {isDeleteBtnClick && (
        <DeleteAllModal setDeleteBtnClick={setDeleteBtnClick} />
      )}

      {showPasswordModal && (
        <RequestPasswordForFileLoad
          setModal={setShowPasswordModal}
          type="Data Password"
          onSubmit={handlePasswordSubmit}
          isAlertModal={isAlertModal}
        />
      )}

      {isAlertModal && (
        <AlertModal
          setAlertModal={setAlertModal}
          isAlertModal={isAlertModal}
          message={alertMessage}
        />
      )}
    </>
  );
}

export default ExpenseManager;
