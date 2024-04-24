import { useMemo } from "react";

// 월 이름을 맵핑하는 객체
const monthNames = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  10: "October",
  11: "November",
  12: "December",
};

// 월 번호를 월 이름으로 변환하는 커스텀 훅
function useMonthName(monthNumber) {
  const monthName = useMemo(() => monthNames[monthNumber], [monthNumber]);
  return monthName;
}

export default useMonthName;
