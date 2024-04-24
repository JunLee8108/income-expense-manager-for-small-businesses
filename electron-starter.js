const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  globalShortcut,
} = require("electron");
// const { autoUpdater } = require("electron-updater");
const fs = require("fs");
const path = require("path");
const isDev = require("electron-is-dev");
const XLSX = require("xlsx");

const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const secretKey = "thisis32bytepleaseIdontknowthisa"; // 32 characters for AES-256

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: "#212121",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  });

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "/build/index.html")}`
  );

  win.once("ready-to-show", function () {
    win.show();
  });

  win.maximize();

  // win.once("ready-to-show", () => {});

  win.on("focus", () => {
    globalShortcut.register("CommandOrControl+S", () => {
      win.webContents.send("trigger-save-data");
    });

    globalShortcut.register("CommandOrControl+L", () => {
      win.webContents.send("trigger-load-data");
    });

    globalShortcut.register("CommandOrControl+I", () => {
      win.webContents.send("activate-insert");
    });
  });

  // Unregister shortcut when window loses focus
  win.on("blur", () => {
    globalShortcut.unregister("CommandOrControl+S");
    globalShortcut.unregister("CommandOrControl+I");
  });

  win.on("close", (e) => {
    const choice = dialog.showMessageBoxSync(win, {
      type: "question",
      buttons: ["Yes", "No"],
      title: "Confirm",
      message:
        "Data will be lost without saving. Are you sure you want to exit? (저장하지 않고 종료시 데이터가 사라질 수 있습니다.)",
    });
    if (choice === 1) {
      e.preventDefault();
    } else {
      globalShortcut.unregisterAll();
      win.destroy();
    }
  });

  const isMac = process.platform === "darwin";

  const template = [
    // App Menu (MacOS)
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    // File Menu
    {
      label: "File",
      submenu: [
        // Other standard file menu items can be added here
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    // Edit Menu
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" },
              { role: "delete" },
              { role: "selectAll" },
              { type: "separator" },
              {
                label: "Speech",
                submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
              },
            ]
          : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
      ],
    },
    // View Menu
    {
      label: "View",
      submenu: [
        // TODO
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    // Window Menu (MacOS has specific window roles)
    ...(isMac
      ? [
          {
            label: "Window",
            submenu: [
              { role: "minimize" },
              { role: "zoom" },
              { type: "separator" },
              { role: "front" },
              { type: "separator" },
              { role: "window" },
            ],
          },
        ]
      : [
          {
            label: "Window",
            submenu: [{ role: "minimize" }, { role: "close" }],
          },
        ]),
    // Help Menu
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://electronjs.org");
          },
        },
        // Other help menu items can be added here
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function encrypt(text) {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// 데이터 복호화 함수
function decrypt(text) {
  let parts = text.split(":");
  let iv = Buffer.from(parts.shift(), "hex");
  let encryptedText = Buffer.from(parts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
// function decrypt(text) {
//   try {
//     let parts = text.split(":");
//     // 암호화된 데이터는 최소한 두 부분(IV와 암호화된 텍스트)으로 구성되어야 합니다.
//     // 그렇지 않은 경우, 원본 텍스트를 그대로 반환합니다.
//     if (parts.length < 2) {
//       return text; // 암호화되지 않은 데이터는 그대로 반환
//     }

//     console.log(1);
//     let iv = Buffer.from(parts.shift(), "hex");
//     let encryptedText = Buffer.from(parts.join(":"), "hex");
//     let decipher = crypto.createDecipheriv(
//       algorithm,
//       Buffer.from(secretKey),
//       iv
//     );
//     let decrypted = decipher.update(encryptedText);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
//     return decrypted.toString();
//   } catch (err) {
//     console.error("Decrypt Error:", err);
//     // 복호화 과정에서 오류가 발생한 경우, 원본 텍스트를 그대로 반환할 수 있습니다.
//     // 또는 사용자에게 오류 메시지를 표시할 수 있습니다.
//     return text; // 복호화 오류 시 원본 데이터 반환
//   }
// }

let autoSaveFilePath = null;

ipcMain.on("save-data", (event, { expenseData, incomeData }) => {
  dialog
    .showSaveDialog({
      title: "Save Data",
      defaultPath: app.getPath("documents"),
      filters: [{ name: "JSON Files", extensions: ["json"] }],
    })
    .then((file) => {
      if (!file.canceled && file.filePath) {
        console.log(incomeData);
        autoSaveFilePath = file.filePath;
        const combinedData = { expenseData, incomeData };
        const encryptedData = encrypt(JSON.stringify(combinedData)); // 데이터 암호화
        // fs.writeFileSync(file.filePath, JSON.stringify(combinedData, null, 2));
        fs.writeFileSync(file.filePath, encryptedData); // 암호화된 데이터 저장
        event.sender.send("saved-data", JSON.parse('"success"'));
        dialog.showMessageBox({
          type: "info",
          title: "Data Saved",
          message: "The data has been successfully saved. (저장 완료)",
        });
      }
    })
    .catch((err) => {
      console.error("Save File Error:", err);
      dialog.showErrorBox("Error", "Failed to save data.");
    });
});

ipcMain.on("auto-save-data", (event, { expenseData, incomeData }) => {
  if (!autoSaveFilePath) {
    console.log("No file path specified for auto-saving.");
    return;
  }

  // 'auto-save' 접미사를 추가하여 새로운 파일 경로 생성
  const autoSaveFileName =
    path.basename(autoSaveFilePath, ".json") + "(auto-save).json";
  const autoSaveFullPath = path.join(
    path.dirname(autoSaveFilePath),
    autoSaveFileName
  );

  try {
    const combinedData = { expenseData, incomeData };
    const encryptedData = encrypt(JSON.stringify(combinedData)); // 데이터 암호화
    // fs.writeFileSync(autoSaveFullPath, JSON.stringify(combinedData, null, 2));
    fs.writeFileSync(autoSaveFullPath, encryptedData);
    // 자동 저장 성공 메시지는 표시하지 않습니다.
    console.log("Data auto-saved successfully to: " + autoSaveFullPath);
  } catch (err) {
    console.error("Auto Save Error:", err);
    dialog.showErrorBox("Error", "Failed to auto-save data.");
  }
});

// Handle load data request
ipcMain.on("load-data", (event) => {
  dialog
    .showOpenDialog({
      title: "Load Data",
      defaultPath: app.getPath("documents"),
      filters: [{ name: "JSON Files", extensions: ["json"] }],
      properties: ["openFile"],
    })
    .then((file) => {
      if (!file.canceled && file.filePaths.length > 0) {
        const filePath = file.filePaths[0]; // 로드한 파일의 원본 경로
        autoSaveFilePath = filePath; // 원본 파일 경로를 저장

        // const data = fs.readFileSync(filePath, "utf8");
        const encryptedData = fs.readFileSync(filePath, "utf8");
        const decryptedData = decrypt(encryptedData); // 데이터 복호화
        event.sender.send("loaded-data", JSON.parse(decryptedData));
        // event.sender.send("loaded-data", JSON.parse(data));

        dialog.showMessageBox({
          type: "info",
          title: "Data Loaded",
          message:
            "The data has been successfully loaded. (성공적으로 로드하였습니다.)",
        });
      }
    })
    .catch((err) => {
      console.error("Load File Error:", err);
      dialog.showErrorBox("Error", "Failed to load data.");
    });
});

ipcMain.on("show-error-dialog", (event, message) => {
  dialog.showErrorBox("Error", message);
});

ipcMain.on("show-warning-dialog", (event, message) => {
  dialog.showErrorBox("warning", message);
});

ipcMain.on("show-info-dialog", (event, message) => {
  dialog.showMessageBox({
    type: "info",
    title: "Remove Successful",
    message: message,
  });
});

ipcMain.on("export-data-to-excel", (event, combinedData) => {
  dialog
    .showSaveDialog({
      title: "Export Data as Excel",
      defaultPath: app.getPath("documents"),
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
    })
    .then((file) => {
      if (!file.canceled && file.filePath) {
        try {
          const workbook = XLSX.utils.book_new();

          // Check and add ExpenseData if available
          if (combinedData.expenseData) {
            const worksheet1 = XLSX.utils.json_to_sheet(
              combinedData.expenseData
            );
            XLSX.utils.book_append_sheet(workbook, worksheet1, "ExpenseData");
          }

          // Check and add incomeData if available
          if (combinedData.incomeData) {
            const worksheet2 = XLSX.utils.json_to_sheet(
              combinedData.incomeData
            );
            XLSX.utils.book_append_sheet(workbook, worksheet2, "incomeData");
          }

          // Write the workbook to the file
          XLSX.writeFile(workbook, file.filePath);

          // Show success message
          dialog.showMessageBox({
            type: "info",
            title: "Export Successful",
            message:
              "The data has been successfully exported to Excel. (엑셀로 내보내기 완료.)",
          });
        } catch (err) {
          console.error("Export Excel File Error:", err);
          dialog.showErrorBox("Error", "Failed to export data.");
        }
      }
    })
    .catch((err) => {
      console.error("Save File Dialog Error:", err);
    });
});

ipcMain.on("open-file-dialog-for-excel", async (event) => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Spreadsheets", extensions: ["xlsx", "xls"] }],
  });

  if (filePaths && filePaths.length > 0) {
    try {
      const file = filePaths[0];
      const fileContent = fs.readFileSync(file, "binary");
      const workbook = XLSX.read(fileContent, { type: "binary" });

      let expenseData = null,
        incomeData = null;

      if (workbook.SheetNames.length > 0) {
        const worksheet1 = workbook.Sheets[workbook.SheetNames[0]];
        expenseData = XLSX.utils.sheet_to_json(worksheet1);
      }

      if (workbook.SheetNames.length > 1) {
        const worksheet2 = workbook.Sheets[workbook.SheetNames[1]];
        incomeData = XLSX.utils.sheet_to_json(worksheet2);
      }

      // Send datasets to the renderer, even if they are null
      event.sender.send("excel-data", expenseData, incomeData);

      dialog.showMessageBox({
        type: "info",
        title: "Success",
        message:
          "The data has been successfully loaded. (성공적으로 로드하였습니다.)",
      });
    } catch (error) {
      console.error("Error loading Excel file:", error);
      dialog.showMessageBox({
        type: "error",
        title: "Error",
        message: "Failed to load the data. Please check the Excel file format.",
      });
    }
  }
});

// app.on("ready", () => {
//   // 앱이 준비 상태가 되면 업데이트 체크 시작
//   autoUpdater.checkForUpdatesAndNotify();
// });

// autoUpdater.on("update-available", () => {
//   dialog.showMessageBox({
//     type: "info",
//     title: "업데이트 가능",
//     message: "새로운 업데이트가 있습니다. 다운로드를 시작하겠습니다.",
//     buttons: ["확인"],
//   });
// });

// autoUpdater.on("update-downloaded", () => {
//   dialog
//     .showMessageBox({
//       type: "question",
//       title: "업데이트 설치",
//       message: "업데이트가 다운로드되었습니다. 지금 설치하시겠습니까?",
//       buttons: ["재시작하고 설치", "나중에"],
//     })
//     .then((response) => {
//       if (response.response === 0) {
//         // 사용자가 '재시작하고 설치'를 선택한 경우
//         autoUpdater.quitAndInstall(); // 앱을 종료하고 업데이트를 설치
//       }
//       // 사용자가 '나중에'를 선택한 경우, 특별히 처리할 내용이 없습니다.
//     });
// });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
