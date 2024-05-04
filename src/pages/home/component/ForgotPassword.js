import { useState } from "react";

const { ipcRenderer } = window.require("electron");

export default function ForgotPassword({
  setForgotPassword,
  setAlertModal,
  setAlertMessage,
}) {
  const [isResetPassword, setPasswordReset] = useState(false);

  const handleOnSubmit = (e) => {
    e.preventDefault();

    const storedSQ1 = localStorage.getItem("encryptedSecurityQuestion1");
    const storedSQ2 = localStorage.getItem("encryptedSecurityQuestion2");

    const form = new FormData(e.currentTarget);
    const sq1 = form.get("securityQuestion1").trim();
    const sq2 = form.get("securityQuestion2").trim();

    ipcRenderer.send("verify-security", { sq1, storedSQ1, sq2, storedSQ2 });
    ipcRenderer.once("security-verified", (event, isMatch) => {
      if (isMatch) {
        setPasswordReset(true);
      } else {
        setAlertModal(true);
        setAlertMessage("Your answer does not match.");
      }
    });
  };

  const handleNewPasswordOnsubmit = (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const password = form.get("newPassword").trim();

    ipcRenderer.send("encrypt-password", password);
    ipcRenderer.once("encrypted-password", (event, encryptedPassword) => {
      localStorage.setItem("encryptedPassword", encryptedPassword);
    });

    setAlertModal(true);
    setAlertMessage("Your password was changed.");

    setForgotPassword(false);
    setPasswordReset(false);
  };

  return (
    <>
      <div className="landing-new-container display-flex-center">
        {!isResetPassword ? (
          <>
            <form onSubmit={handleOnSubmit} className="display-flex-center">
              <label htmlFor="securityQuestion1">🚀 Security Question 1</label>
              <span className="security-question">• Favorite color?</span>
              <input
                type="text"
                placeholder="Answer"
                name="securityQuestion1"
                id="securityQuestion1"
                required
              ></input>

              <label htmlFor="securityQuestion2">🚀 Security Question 2</label>
              <span className="security-question">• Favorite food?</span>
              <input
                type="text"
                placeholder="Answer"
                name="securityQuestion2"
                id="securityQuestion2"
                required
              ></input>

              <button type="submit" className="landing-new-container-start">
                Submit
              </button>
            </form>

            <div className="back-btn-container">
              <button onClick={() => setForgotPassword(false)}>←</button>
            </div>
          </>
        ) : (
          <>
            <form
              className="display-flex-center animation"
              onSubmit={handleNewPasswordOnsubmit}
            >
              <label htmlFor="newPassword">🚀 Your New Password</label>
              <input
                type="password"
                placeholder="Password"
                id="newPassword"
                name="newPassword"
                required
              ></input>
              <button type="submit" className="landing-new-container-start">
                Submit
              </button>
            </form>

            <div className="back-btn-container">
              <button onClick={() => setPasswordReset(false)} type="button">
                ←
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
