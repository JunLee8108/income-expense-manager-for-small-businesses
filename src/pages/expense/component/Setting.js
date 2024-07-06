import AddTapModal from "../../../component/common/AddTapModal";
import YesNoModal from "../../../component/common/modal/YesNoModal";
import AlertModal from "../../../component/common/modal/AlertModal";

import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { incomeHeadersState } from "../../../recoil/store";
import {
  tapsState,
  expenseCategoryTabsState,
  expenseDataState,
} from "../../../recoil/store";

export default function Setting({
  taxOn,
  handleSettingTax,
  setDeleteBtnClick,
}) {
  const expenseDataLength = useRecoilValue(expenseDataState).length;
  const [taps, setTaps] = useRecoilState(tapsState);
  const [expenseCategoryTabs, setExpenseCategoryTabs] = useRecoilState(
    expenseCategoryTabsState
  );
  const [incomeHeaders, setIncomeHeaders] = useRecoilState(incomeHeadersState);

  const [newHeaderLabel, setNewHeaderLabel] = useState("");
  const [newHeaderType, setNewHeaderType] = useState("string");
  const [newHeaderRole, setNewHeaderRole] = useState(""); // 새로운 role 상태 추가
  const [tempHeaders, setTempHeaders] = useState([...incomeHeaders]);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [selectedTapFrom, setSelectedTapFrom] = useState("");
  const [selectedTapCategory, setSelectedTapCategory] = useState("");
  const [isConfirmModalFrom, setConfirmModalFrom] = useState(false);
  const [isConfirmModalCategory, setConfirmModalCategory] = useState(false);
  const [isAlertModal, setAlertModal] = useState(false);
  const [messageFrom, setMessageFrom] = useState("");
  const [messageCategory, setMessageCategory] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [activeSection, setActiveSection] = useState("null");

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleOnConfirmFrom = () => {
    const filteredTaps = taps.filter((tap) => tap !== selectedTapFrom);
    localStorage.setItem("taps", JSON.stringify(filteredTaps));
    setTaps(filteredTaps);
    setSelectedTapFrom("");
  };

  const handleOnConfirmCategory = () => {
    const filteredCategories = expenseCategoryTabs.filter(
      (category) => category !== selectedTapCategory
    );
    localStorage.setItem(
      "expenseCategoryTabs",
      JSON.stringify(filteredCategories)
    );
    setExpenseCategoryTabs(filteredCategories);
    setSelectedTapCategory("");
  };

  const handleAddHeader = () => {
    if (!newHeaderLabel) return;
    const key = newHeaderLabel.replace(/\s+/g, "").toLowerCase();
    const newHeader = {
      key,
      label: newHeaderLabel,
      type: newHeaderType,
      role: newHeaderRole || "None",
    };
    const updatedHeaders = [...tempHeaders, newHeader];
    setTempHeaders(updatedHeaders);
    setNewHeaderLabel("");
    setNewHeaderType("string");
    setNewHeaderRole(""); // 새로운 role 상태 초기화
  };

  const handleDeleteHeader = (key) => {
    const updatedHeaders = tempHeaders.filter((header) => header.key !== key);
    setTempHeaders(updatedHeaders);
  };

  const handleTempEditHeader = (key, newLabel, newType, newRole) => {
    const updatedHeaders = tempHeaders.map((header) =>
      header.key === key
        ? { ...header, label: newLabel, type: newType, role: newRole }
        : header
    );
    setTempHeaders(updatedHeaders);
  };

  const handleSubmitHeaders = () => {
    setIncomeHeaders(tempHeaders);
    localStorage.setItem("incomeHeaders", JSON.stringify(tempHeaders));
    setAlertModal(true);
    setAlertMessage("Your change was saved.");
  };

  const onDragStart = (index) => {
    setDraggedIndex(index);
  };

  const onDragEnter = (index) => {
    if (draggedIndex === index) return;
    const updatedHeaders = [...tempHeaders];
    const [draggedItem] = updatedHeaders.splice(draggedIndex, 1);
    updatedHeaders.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setTempHeaders(updatedHeaders);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <>
      <div className="settings-container animation">
        <div className="settings-tab">
          <h2
            className={`settings-title ${
              activeSection === "expense" && "settings-title-active"
            }`}
            onClick={() => toggleSection("expense")}
          >
            Expense Manager
            <span
              className={`arrow-icon ${
                activeSection === "expense" ? "rotate-up" : ""
              }`}
            >
              &#9650;
            </span>
          </h2>

          {activeSection === "expense" && (
            <div className="active-tab animation">
              <div className="active-tab-box">
                <h2>
                  🚀 From Tab <span style={{ fontSize: "0.9rem" }}>(출처)</span>
                </h2>
                <AddTapModal
                  type="taps"
                  selectedTap={selectedTapFrom}
                  setSelectedTap={setSelectedTapFrom}
                  setConfirmModal={setConfirmModalFrom}
                  setMessage={setMessageFrom}
                  setAlertModal={setAlertModal}
                  setAlertMessage={setAlertMessage}
                />
              </div>

              <div className="active-tab-box">
                <h2>
                  🚀 Category Tab{" "}
                  <span style={{ fontSize: "0.9rem" }}>(카테고리)</span>
                </h2>
                <AddTapModal
                  type="expenseCategoryTabs"
                  selectedTap={selectedTapCategory}
                  setSelectedTap={setSelectedTapCategory}
                  setConfirmModal={setConfirmModalCategory}
                  setMessage={setMessageCategory}
                  setAlertModal={setAlertModal}
                  setAlertMessage={setAlertMessage}
                />
              </div>

              <div className="active-tab-box">
                <h2>
                  🚀 Activate Tax{" "}
                  <span style={{ fontSize: "0.9rem" }}>(세금 활성화)</span>
                </h2>

                <center>
                  <button
                    className={`settings-tax-button ${
                      taxOn ? "settings-tax-active" : ""
                    }`}
                    onClick={handleSettingTax("on")}
                  >
                    On
                  </button>
                  <button
                    className={`settings-tax-button ${
                      !taxOn ? "settings-tax-active" : ""
                    }`}
                    onClick={handleSettingTax("off")}
                  >
                    off
                  </button>
                </center>
              </div>
            </div>
          )}
        </div>

        <div className="settings-tab">
          <h2
            className={`settings-title ${
              activeSection === "income" && "settings-title-active"
            }`}
            onClick={() => toggleSection("income")}
          >
            Income Manager
            <span
              className={`arrow-icon ${
                activeSection === "income" ? "rotate-up" : ""
              }`}
            >
              &#9650;
            </span>
          </h2>

          {activeSection === "income" && (
            <div className="active-tab animation">
              <div className="active-tab-box income-headers">
                <h2>🚀 Customize Income Headers</h2>
                <div className="new-header-container">
                  <input
                    type="text"
                    value={newHeaderLabel}
                    onChange={(e) => setNewHeaderLabel(e.target.value)}
                    placeholder="Label"
                  />
                  <select
                    value={newHeaderType}
                    onChange={(e) => setNewHeaderType(e.target.value)}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  {newHeaderType === "number" && (
                    <select
                      value={newHeaderRole}
                      onChange={(e) => setNewHeaderRole(e.target.value)}
                    >
                      <option value="">None</option>
                      <option value="+">+</option>
                      <option value="-">-</option>
                    </select>
                  )}
                </div>
                <button onClick={handleAddHeader} className="add-header">
                  Add Header
                </button>

                <div onMouseUp={onDragEnd} className="draggable-container">
                  {tempHeaders.map((header, index) => (
                    <div
                      key={header.key}
                      draggable="true"
                      onDragStart={() => onDragStart(index)}
                      onDragEnter={() => onDragEnter(index)}
                      onDragEnd={onDragEnd}
                      className="draggable-item"
                      style={{
                        backgroundColor:
                          index === draggedIndex
                            ? "#779ecb"
                            : index === dragOverIndex
                            ? "#d0e0ff"
                            : "#ffffff",
                      }}
                    >
                      <input
                        type="text"
                        value={header.label}
                        onChange={(e) =>
                          handleTempEditHeader(
                            header.key,
                            e.target.value,
                            header.type,
                            header.role
                          )
                        }
                        placeholder="Label"
                        disabled={header.label === "Total" && true}
                      />
                      <select
                        value={header.type}
                        onChange={(e) =>
                          handleTempEditHeader(
                            header.key,
                            header.label,
                            e.target.value,
                            header.role
                          )
                        }
                        disabled={header.label === "Total" && true}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <select
                        value={header.role || ""}
                        onChange={(e) =>
                          handleTempEditHeader(
                            header.key,
                            header.label,
                            header.type,
                            e.target.value
                          )
                        }
                        disabled={
                          header.label === "Total" || header.type !== "number"
                            ? true
                            : false
                        }
                      >
                        <option value="">None</option>
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                      {header.label !== "Total" && (
                        <button onClick={() => handleDeleteHeader(header.key)}>
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={handleSubmitHeaders} style={{ width: "100%" }}>
                  Save Changes
                </button>
              </div>

              <div className="active-tab-box">
                <h2>
                  🚀 Change a Store Name
                  <span style={{ fontSize: "0.9rem" }}>(가게 이름 변경)</span>
                </h2>
              </div>
            </div>
          )}
        </div>

        <div className="settings-tab">
          <h2
            className={`settings-title ${
              activeSection === "general" && "settings-title-active"
            }`}
            onClick={() => toggleSection("general")}
          >
            General
            <span
              className={`arrow-icon ${
                activeSection === "general" ? "rotate-up" : ""
              }`}
            >
              &#9650;
            </span>
          </h2>

          {activeSection === "general" && (
            <div className="active-tab animation">
              <div className="active-tab-box">
                <h2>
                  🚀 Change a Store Name
                  <span style={{ fontSize: "0.9rem" }}>(가게 이름 변경)</span>
                </h2>
              </div>

              <div className="active-tab-box">
                <h2>
                  🚀 Delete All Data
                  <span style={{ fontSize: "0.9rem" }}>(전체 데이터 삭제)</span>
                </h2>

                <button
                  className="delete-all-btn"
                  onClick={() => {
                    if (expenseDataLength > 0) {
                      setDeleteBtnClick(true);
                    }
                  }}
                >
                  DELETE ALL (전체 삭제)
                </button>
              </div>

              <div className="active-tab-box">
                <h2>
                  🚀 Reset to Factory Settings
                  <span style={{ fontSize: "0.9rem" }}>(모든 설정 초기화)</span>
                </h2>
              </div>

              <div className="active-tab-box">
                <h2>
                  🚀 Language
                  <span style={{ fontSize: "0.9rem" }}>(언어)</span>
                </h2>

                <select className="settings-language-select">
                  <option>English</option>
                  <option>Korean</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {isConfirmModalFrom && (
        <YesNoModal
          setConfirmModal={setConfirmModalFrom}
          isConfirmModal={isConfirmModalFrom}
          onConfirm={handleOnConfirmFrom}
          message={messageFrom}
        />
      )}

      {isConfirmModalCategory && (
        <YesNoModal
          setConfirmModal={setConfirmModalCategory}
          isConfirmModal={isConfirmModalCategory}
          onConfirm={handleOnConfirmCategory}
          message={messageCategory}
        />
      )}

      {isAlertModal && (
        <AlertModal setAlertModal={setAlertModal} message={alertMessage} />
      )}
    </>
  );
}
