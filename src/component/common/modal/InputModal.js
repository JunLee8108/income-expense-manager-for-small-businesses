import React from "react";
import "./Modal.css";
import AlertModal from "./AlertModal";

import { useState, useEffect, useRef } from "react";

const { ipcRenderer } = window.require("electron");

const InputModal = ({ setModal, type, onSubmit }) => {
  const [message, setMessage] = useState("");
  const [isAlertModal, setAlertModal] = useState(false);
  const [capsLockWarning, setCapsLockWarning] = useState(false);
  const inputRef = useRef(null);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    inputRef.current.blur();

    const encryptedPassword = localStorage.getItem("encryptedPassword");

    const form = new FormData(e.currentTarget);
    const password = form.get("password");

    ipcRenderer.send("verify-password", { password, encryptedPassword });
    ipcRenderer.once("password-verified", (event, isMatch) => {
      if (isMatch) {
        if (onSubmit.length > 0) {
          onSubmit(password);
        } else {
          onSubmit();
        }
      } else {
        setAlertModal(true);
        setMessage("Password does not match");
      }
    });
  };

  const handleKeyPress = (e) => {
    const isCapsLockOn = e.getModifierState("CapsLock");
    setCapsLockWarning(isCapsLockOn);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (!isAlertModal) {
          event.stopPropagation();
          setModal(false);
        }
      }
    };

    if (!isAlertModal) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setModal, isAlertModal]);

  return (
    <>
      <div
        className="item-input-bg input-modal"
        onClick={(e) => {
          const target = document.querySelector(".item-input-bg.input-modal");
          if (e.target === target) {
            setModal(false);
          }
        }}
      >
        <form className="modal-content animation" onSubmit={handleOnSubmit}>
          <p>{type}</p>
          <input
            className="modal-input"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            ref={inputRef}
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
