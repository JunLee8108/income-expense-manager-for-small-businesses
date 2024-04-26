import React from "react";
import "./Modal.css";
import AlertModal from "./AlertModal";

import { useState, useEffect, useRef } from "react";

const { ipcRenderer } = window.require("electron");

const InputModal = ({ setModal, type, onSubmit }) => {
  const [message, setMessage] = useState("");
  const [isAlertModal, setAlertModal] = useState(false);
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const passwordInputRef = useRef(null);

  const handleOnSubmit = (e) => {
    e.preventDefault();

    const encryptedPassword = localStorage.getItem("encryptedPassword");

    const form = new FormData(e.currentTarget);
    const password = form.get("password");

    ipcRenderer.send("verify-password", { password, encryptedPassword });
    ipcRenderer.once("password-verification", (event, response) => {
      if (!response) {
        setAlertModal(true);
        setMessage("Password does not match");
      } else {
        onSubmit();
      }
    });
  };

  const handleKeyPress = (e) => {
    const isCapsLockOn = e.getModifierState("CapsLock");
    setCapsLockWarning(isCapsLockOn);
  };

  useEffect(() => {
    passwordInputRef.current.focus();
  }, []);

  return (
    <>
      <div
        className="item-input-bg"
        onClick={(e) => {
          const target = document.querySelector(".item-input-bg");
          if (e.target === target) {
            setModal(false);
          }
        }}
      >
        <form className="modal-content animation" onSubmit={handleOnSubmit}>
          <p>{type}</p>
          <input
            ref={passwordInputRef}
            className="modal-input"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            onKeyUp={handleKeyPress}
          ></input>
          {capsLockWarning && (
            <p className="caps-lock-warning">* Caps Lock is ON</p>
          )}
          <button className="modal-button">Submit</button>
        </form>
      </div>

      {isAlertModal && (
        <AlertModal setAlertModal={setAlertModal} message={message} />
      )}
    </>
  );
};
export default InputModal;
