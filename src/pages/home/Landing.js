import "./Landing.css";
import YesNoModal from "../../component/common/modal/YesNoModal";
import AlertModal from "../../component/common/modal/AlertModal";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const [isNewData, setNewData] = useState(false);
  const [isConfirmModal, setConfirmModal] = useState(false);
  const [isConfirmModalForCurrentUser, setConfirmModalForCurrentUser] =
    useState(false);
  const [message, setMessage] = useState("");
  const [isAlertModal, setAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [storeName, setStoreName] = useState("");

  const navigateToExpenseManager = () => {
    navigate("/expense", { replace: true });
  };

  const handleSetNewData = (boolean) => () => {
    setNewData(boolean);
  };

  const handleStoreNameSubmit = (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const storeName = form.get("storeName");
    setStoreName(storeName);

    // const password = form.get("password");

    setConfirmModal(true);
    setMessage(
      "If existing data is present, it will be deleted for a fresh start. Do you wish to continue? (기존 정보가 있다면 모두 삭제 됩니다. 계속 하시겠습니까?)"
    );
  };

  const handleCurrentUserClick = () => {
    const currentStoreName = localStorage.getItem("storeName");
    if (!currentStoreName) {
      setAlertModal(true);
      setAlertMessage("No Data!");
      return;
    }

    setConfirmModalForCurrentUser(true);
    setMessage(`Store Name(가게 이름):\n${currentStoreName}, Correct?`);
  };

  return (
    <>
      <div className="landing-bg">
        <div className="landing-container animation">
          <h1 className="landing-title">Money Insight</h1>

          {!isNewData ? (
            <>
              <h2 className="landing-sub-title">
                Understand your earnings, enhance your possibilities
              </h2>

              <h2 className="landing-sub-title landing-sub-title-korean">
                수입을 이해하고 가능성을 향상시키세요.
              </h2>
            </>
          ) : null}

          {!isNewData ? (
            <>
              <div className="logo-container">
                <img
                  src="./img/logo.webp"
                  alt="Hanara Sushi Logo"
                  className="logo"
                />
              </div>

              <div className="landing-select-container">
                <button
                  className="landing-password-new"
                  onClick={handleSetNewData(true)}
                >
                  New User
                </button>

                <button
                  className="landing-password-current"
                  onClick={handleCurrentUserClick}
                >
                  Current User
                </button>
              </div>
            </>
          ) : (
            <div className="landing-new-container animation">
              <form onSubmit={handleStoreNameSubmit}>
                <h3>Your Store Name:</h3>
                <input
                  type="text"
                  placeholder="Store Name (가게 이름)"
                  name="storeName"
                  required
                ></input>
                {/* <input
                type="password"
                placeholder="Password"
                name="password"
                required
              ></input> */}
                <button type="submit" className="landing-new-container-start">
                  START
                </button>
              </form>

              <div className="back-btn-container">
                <button onClick={handleSetNewData(false)}>←</button>
              </div>
            </div>
          )}

          <p className="landing-owner">Developed by Jeong Hyun Lee</p>
        </div>
      </div>

      {isConfirmModal && (
        <YesNoModal
          setConfirmModal={setConfirmModal}
          isConfirmModal={isConfirmModal}
          onConfirm={() => {
            localStorage.clear();
            localStorage.setItem("storeName", storeName);
            navigateToExpenseManager();
          }}
          message={message}
        />
      )}

      {isConfirmModalForCurrentUser && (
        <YesNoModal
          setConfirmModal={setConfirmModalForCurrentUser}
          isConfirmModal={isConfirmModalForCurrentUser}
          onConfirm={navigateToExpenseManager}
          message={message}
        />
      )}

      {isAlertModal && (
        <AlertModal setAlertModal={setAlertModal} message={alertMessage} />
      )}
    </>
  );
}
