import { useCallback } from "react";

export const useSortByDate = () => {
  try {
    const sortByDate = useCallback((data, toggle, setData) => {
      // Make a shallow copy to avoid mutating the original array
      const copy = [...data];

      // Sort by 'sort' attribute
      copy.sort((a, b) => {
        const fa = a.category.toLowerCase(),
          fb = b.category.toLowerCase();
        return fa < fb ? -1 : fa > fb ? 1 : 0;
      });

      // Then by 'from' attribute
      copy.sort((a, b) => {
        const fa = a.from.toLowerCase(),
          fb = b.from.toLowerCase();
        return fa < fb ? -1 : fa > fb ? 1 : 0;
      });

      // Finally, by 'date', parsing the strings to dates
      copy.sort((a, b) => {
        const dateA = new Date(a.date.replaceAll("-", "/"));
        const dateB = new Date(b.date.replaceAll("-", "/"));
        return dateA - dateB;
      });

      // Apply the sorted data based on the toggle status
      if (toggle === "on") {
        setData(copy);
      }
    }, []);

    return sortByDate;
  } catch (error) {
    console.log("error:", error);
  }
};
