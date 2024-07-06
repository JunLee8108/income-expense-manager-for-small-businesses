import { useMemo } from "react";

// 월 이름을 맵핑하는 객체
const monthNames = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "Aug",
  "09": "Sept",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

// 월 번호를 월 이름으로 변환하는 커스텀 훅
function useMonthName(monthNumber) {
  const monthName = useMemo(() => monthNames[monthNumber], [monthNumber]);
  return monthName;
}

export default useMonthName;
