import AddTapModal from "../../../component/common/AddTapModal";
import YesNoModal from "../../../component/common/modal/YesNoModal";
import AlertModal from "../../../component/common/modal/AlertModal";

import { useState } from "react";

export default function Setting({
  taps,
  setTaps,
  taxOn,
  handleSettingTax,
  expenseDataLength,
  setDeleteBtnClick,
}) {
  const [selectedTap, setSelectedTap] = useState("");
  const [isConfirmModal, setConfirmModal] = useState(false);
  const [isAlertModal, setAlertModal] = useState(false);
  const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const handleOnConfirm = () => {
    const filteredTaps = taps.filter((tap) => tap !== selectedTap);
    localStorage.setItem("taps", JSON.stringify(filteredTaps));
    setTaps(filteredTaps);
    setSelectedTap("");
  };

  return (
    <>
      <div className="settings-container animation">
        <div className="settings-tab">
          <h2 className="settings-title">From Tap Setting (출처 탭 관리)</h2>
          <AddTapModal
            taps={taps}
            setTaps={setTaps}
            selectedTap={selectedTap}
            setSelectedTap={setSelectedTap}
            setConfirmModal={setConfirmModal}
            setMessage={setMessage}
            setAlertModal={setAlertModal}
            setAlertMessage={setAlertMessage}
          />
        </div>

        <div className="settings-tab">
          <h2 className="settings-title">
            Category Tap Setting (카테고리 탭 관리)
          </h2>
          <AddTapModal taps={taps} setTaps={setTaps} />
        </div>

        <div className="settings-tab">
          <h2 className="settings-title">
            Activate Tax Input (세금 입력 활성화)
          </h2>
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
        </div>

        <div className="settings-tab">
          <h2 className="settings-title">
            Change a Store Name (가게 이름 변경)
          </h2>
        </div>

        <div className="settings-tab">
          <h2 className="settings-title">Delete All Data (전체 데이터 삭제)</h2>

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

        <div className="settings-tab">
          <h2 className="settings-title">
            Reset to Factory Settings (모든 설정 초기화)
          </h2>
        </div>
      </div>

      {isConfirmModal && (
        <YesNoModal
          setConfirmModal={setConfirmModal}
          isConfirmModal={isConfirmModal}
          onConfirm={handleOnConfirm}
          message={message}
        />
      )}

      {isAlertModal && (
        <AlertModal setAlertModal={setAlertModal} message={alertMessage} />
      )}
    </>
  );
}
