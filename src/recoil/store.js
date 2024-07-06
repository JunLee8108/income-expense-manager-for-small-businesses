import { atom, selector } from "recoil";
import { foodSortList } from "../component/util/data";

// 지출 데이터 상태를 저장하는 atom
export const expenseDataState = atom({
  key: "expenseDataState",
  default: [],
});

// 수입 데이터 상태를 저장하는 atom
export const incomeDataState = atom({
  key: "incomeDataState",
  default: [],
});

// taps 상태를 저장하는 atom
export const tapsState = atom({
  key: "tapsState", // 고유한 키
  default: (() => {
    const loadedTaps = localStorage.getItem("taps");
    return loadedTaps ? JSON.parse(loadedTaps) : ["Overview"];
  })(), // 초기 상태 값
});

// expenseCategoryTabs 상태를 저장하는 atom
export const expenseCategoryTabsState = atom({
  key: "expenseCategoryTabsState",
  default: (() => {
    const loadedExpenseCategoryTabs = localStorage.getItem(
      "expenseCategoryTabs"
    );
    return loadedExpenseCategoryTabs
      ? JSON.parse(loadedExpenseCategoryTabs)
      : foodSortList;
  })(),
});

const loadHeadersFromLocalStorage = () => {
  const storedHeaders = localStorage.getItem("incomeHeaders");
  return storedHeaders
    ? JSON.parse(storedHeaders)
    : [
        { key: "date", label: "Date", type: "date", role: "None" },
        { key: "source", label: "Source", type: "text", role: "None" },
        { key: "netincome", label: "Net Income", type: "number", role: "+" },
        { key: "tax", label: "Tax", type: "number", role: "+" },
        { key: "servicefee", label: "Service Fee", type: "number", role: "-" },
        { key: "total", label: "Total", type: "number", role: "None" },
      ];
};

export const incomeHeadersState = atom({
  key: "incomeHeadersState",
  default: loadHeadersFromLocalStorage(),
});

export const saveHeadersToLocalStorage = selector({
  key: "saveHeadersToLocalStorage",
  get: ({ get }) => get(incomeHeadersState),
  set: ({ get }) => {
    const headers = get(incomeHeadersState);
    localStorage.setItem("incomeHeaders", JSON.stringify(headers));
  },
});
