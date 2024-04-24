// import { useEffect } from "react";

// function useAutoSaveData(expenseData, incomeData) {
//   const { ipcRenderer } = window.require("electron");
//   useEffect(() => {
//     const saveInterval = 300000; // 5분
//     // const saveInterval = 10000; // 30초

//     const autoSave = () => {
//       ipcRenderer.send("auto-save-data", { expenseData, incomeData });
//     };

//     const intervalId = setInterval(autoSave, saveInterval);

//     return () => clearInterval(intervalId); // 컴포넌트가 언마운트될 때 인터벌 정리
//     // eslint-disable-next-line
//   }, [expenseData, incomeData]); // 의존성 배열에 데이터를 포함시켜 데이터 변경 시에도 업데이트
// }

// export default useAutoSaveData;

import { useEffect, useRef } from "react";
import { isEqual } from "lodash";

function useAutoSaveData(expenseData, incomeData) {
  // const { ipcRenderer } = window.require("electron");
  // const lastSavedDataRef = useRef({ expenseData, incomeData });
  // useEffect(() => {
  //   // 데이터가 초기화되지 않았거나 fileId가 없는 경우, 자동 저장을 실행하지 않습니다.
  //   // if (!dataInitialized || !fileId) return;
  //   // 자동 저장 함수
  //   const autoSave = () => {
  //     console.log("Data saved automatically");
  //     ipcRenderer.send("auto-save-data", { expenseData, incomeData });
  //     // 마지막 저장된 데이터를 업데이트합니다.
  //     lastSavedDataRef.current = { expenseData, incomeData };
  //   };
  //   // expenseData 또는 incomeData가 변경되었는지 확인합니다.
  //   if (!isEqual(lastSavedDataRef.current, { expenseData, incomeData })) {
  //     console.log("Data has changed, performing auto save");
  //     autoSave(); // 변경된 경우, 자동 저장을 실행합니다.
  //   } else {
  //     console.log("No changes detected, skipping auto save");
  //   }
  //   // 의존성 배열에 포함된 변수들이 변경될 때마다 이 효과를 실행합니다.
  // }, [expenseData, incomeData]);
}

export default useAutoSaveData;
