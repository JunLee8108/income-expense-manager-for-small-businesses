import { useCallback } from "react";
import { useRecoilValue } from "recoil";
import { incomeHeadersState } from "../../recoil/store";

// Custom hook for sorting numbers
export const useSortNumbers = () => {
  const incomeHeaders = useRecoilValue(incomeHeadersState);

  try {
    const sortNumbers = useCallback((data, setData, sortingOrder, sortBy) => {
      const copy = [...data];

      const keyMap = {
        amount: "amount",
        tax: "tax",
      };

      incomeHeaders.forEach((header) => {
        keyMap[header.key] = header.key;
      });

      const key = keyMap[sortBy] || "amount";

      copy.sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];

        if (sortingOrder === "ascending") {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });

      setData(copy);
    }, []);

    return sortNumbers;
  } catch (error) {
    console.log("error:", error);
  }
};
