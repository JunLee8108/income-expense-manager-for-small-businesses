import "./Landing.css";
import YesNoModal from "../../component/common/modal/YesNoModal";
import AlertModal from "../../component/common/modal/AlertModal";
import InputModal from "../../component/common/modal/InputModal";
import Loading from "../../component/common/Loading";
import ForgotPassword from "./component/ForgotPassword";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const { ipcRenderer } = window.require("electron");

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
  const [encryptedPassword, setEncryptedPassword] = useState("");
  const [securityQuestion1, setSecurityQuestion1] = useState("");
  const [securityQuestion2, setSecurityQuestion2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModal, setPasswordModal] = useState(false);
  const [isPasswordModalForNewUser, setPasswordModalForNewUser] =
    useState(false);
  const [isForgotPassword, setForgotPassword] = useState(false);
  const [capsLockWarning, setCapsLockWarning] = useState(false);

  const setLocalStorageAndNavigate = () => {
    localStorage.clear();
    localStorage.setItem("storeName", storeName);
    localStorage.setItem("encryptedPassword", encryptedPassword);
    localStorage.setItem("encryptedSecurityQuestion1", securityQuestion1);
    localStorage.setItem("encryptedSecurityQuestion2", securityQuestion2);
    navigateToExpenseManager();
  };

  const handleOnConfirmForConfirmModal = () => {
    const storedEncryptedPassword = localStorage.getItem("encryptedPassword");

    if (!storedEncryptedPassword) {
      return setLocalStorageAndNavigate();
    }

    setPasswordModalForNewUser(true);
  };

  const navigateToExpenseManager = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/expense", { replace: true });
    }, 1000);
  };

  const handleSetNewData = (boolean) => () => {
    setNewData(boolean);
  };

  const handleStoreNameSubmit = (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const storeName = form.get("storeName");
    const password = form.get("password").trim();
    const sq1 = form.get("securityQuestion1").trim();
    const sq2 = form.get("securityQuestion2").trim();

    setStoreName(storeName);

    // 비밀번호 암호화 요청
    ipcRenderer.send("encrypt-password", password);
    ipcRenderer.once("encrypted-password", (event, encryptedPassword) => {
      setEncryptedPassword(encryptedPassword);
    });

    // 보안 질문 1 암호화 요청
    ipcRenderer.send("encrypt-sq1", sq1);
    ipcRenderer.once("encrypted-sq1", (event, sq1) => {
      setSecurityQuestion1(sq1);
    });

    // 보안 질문 2 암호화 요청
    ipcRenderer.send("encrypt-sq2", sq2);
    ipcRenderer.once("encrypted-sq2", (event, sq2) => {
      setSecurityQuestion2(sq2);
    });

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

  const handleKeyPress = (e) => {
    // Caps Lock 감지
    const isCapsLockOn = e.getModifierState("CapsLock");
    setCapsLockWarning(isCapsLockOn);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const handleKeyDownForInput = (e) => {
    if (e.key === "Enter") {
      setTimeout(() => {
        e.target.blur();
      }, 100);
    }
  };

  const handleForgotPassword = () => {
    const storedSQ1 = localStorage.getItem("encryptedSecurityQuestion1");
    const storedSQ2 = localStorage.getItem("encryptedSecurityQuestion2");

    if (!storedSQ1 || !storedSQ2) {
      setAlertModal(true);
      setAlertMessage("No data");
      return;
    }

    setForgotPassword(true);
  };

  return (
    <>
      <div className="landing-bg display-flex-center">
        <div className="landing-container animation">
          <h1 className="landing-title">Money Insight</h1>

          {!isNewData && !isForgotPassword && (
            <>
              <h2 className="landing-sub-title">
                Understand your earnings, enhance your possibilities
              </h2>

              <h2 className="landing-sub-title landing-sub-title-korean">
                수입을 이해하고 가능성을 향상시키세요.
              </h2>
            </>
          )}

          {!isNewData && !isForgotPassword && (
            <>
              <div className="logo-container">
                <img
                  src="./img/logo2.webp"
                  alt="Hanara Sushi Logo"
                  className="logo"
                />
              </div>

              <div className="landing-select-container display-flex-center">
                <button
                  className="landing-password-new"
                  onClick={handleSetNewData(true)}
                >
                  New User
                </button>

                <button
                  className="landing-password-current"
                  onClick={handleCurrentUserClick}
                  onKeyDown={handleKeyDown}
                >
                  Current User
                </button>
              </div>

              <div>
                <p
                  className="landing-forgot-password"
                  onClick={handleForgotPassword}
                >
                  FORGOT PASSWORD?
                </p>
              </div>
            </>
          )}

          {!isNewData && isForgotPassword && (
            <ForgotPassword
              setForgotPassword={setForgotPassword}
              setAlertModal={setAlertModal}
              setAlertMessage={setAlertMessage}
            />
          )}

          {isNewData && (
            <div className="landing-new-container display-flex-center">
              <form
                onSubmit={handleStoreNameSubmit}
                className="display-flex-center"
                onKeyDown={handleKeyDownForInput}
              >
                <label htmlFor="storeName">🚀 Store Name</label>
                <input
                  type="text"
                  placeholder="Store Name (가게 이름)"
                  name="storeName"
                  id="storeName"
                  required
                ></input>

                <label htmlFor="password">🚀 Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  id="password"
                  onKeyUp={handleKeyPress}
                  required
                ></input>

                <label htmlFor="securityQuestion1">
                  🚀 Security Question 1
                </label>
                <span className="security-question">• Favorite color?</span>
                <input
                  type="text"
                  placeholder="Answer"
                  name="securityQuestion1"
                  id="securityQuestion1"
                  required
                ></input>

                <label htmlFor="securityQuestion2">
                  🚀 Security Question 2
                </label>
                <span className="security-question">• Favorite food?</span>
                <input
                  type="text"
                  placeholder="Answer"
                  name="securityQuestion2"
                  id="securityQuestion2"
                  required
                ></input>

                {capsLockWarning && (
                  <p className="caps-lock-warning caps-lock-warning-register">
                    * Caps Lock is ON
                  </p>
                )}
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
          onConfirm={handleOnConfirmForConfirmModal}
          message={message}
        />
      )}

      {isConfirmModalForCurrentUser && (
        <YesNoModal
          setConfirmModal={setConfirmModalForCurrentUser}
          isConfirmModal={isConfirmModalForCurrentUser}
          onConfirm={() => setPasswordModal(true)}
          message={message}
        />
      )}

      {isLoading && <Loading />}

      {isPasswordModal && (
        <InputModal
          setModal={setPasswordModal}
          isAlertModal={isAlertModal}
          type="Passowrd"
          onSubmit={navigateToExpenseManager}
        />
      )}

      {isPasswordModalForNewUser && (
        <InputModal
          setModal={setPasswordModalForNewUser}
          type={localStorage.getItem("storeName")}
          onSubmit={setLocalStorageAndNavigate}
        />
      )}

      {isAlertModal && (
        <AlertModal setAlertModal={setAlertModal} message={alertMessage} />
      )}
    </>
  );
}
