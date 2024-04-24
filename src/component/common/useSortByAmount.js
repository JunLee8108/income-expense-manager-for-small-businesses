import { useCallback } from "react";

export const useSortByAmount = () => {
  const sortByAmount = useCallback((data, setData, highOrLow) => {
    const sortedData = [...data].sort((a, b) => {
      const fa = parseInt(a.date.replaceAll("-", "")),
        fb = parseInt(b.date.replaceAll("-", ""));
      if (fa !== fb) return fa < fb ? -1 : 1;
      const amountDiff = parseFloat(a.amount) - parseFloat(b.amount);
      return highOrLow === "low" ? amountDiff : -amountDiff;
    });
    setData(sortedData);
  }, []);

  return sortByAmount;
};
