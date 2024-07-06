import { useCallback } from "react";

// Custom hook for sorting data
export const useSortStrings = () => {
  try {
    const sortStrings = useCallback((data, setData, sortingOrder, sortBy) => {
      const copy = [...data];

      const keyMap = {
        from: "from",
        category: "category",
        item: "item",
        source: "source",
      };

      const key = keyMap[sortBy] || "from";

      copy.sort((a, b) => {
        let fa = a[key].toLowerCase();
        let fb = b[key].toLowerCase();

        if (sortingOrder === "ascending") {
          return fa.localeCompare(fb);
        } else {
          return fb.localeCompare(fa);
        }
      });

      setData(copy);
    }, []);

    return sortStrings;
  } catch (error) {
    console.log("error:", error);
  }
};
