import "./IncomeInsertModal.css";
import { generateRandomID, isIDUnique } from "../util/assignID";
import AlertModal from "./modal/AlertModal";
import { Fragment, useState } from "react";
import { useRecoilState } from "recoil";
import { incomeHeadersState, incomeDataState } from "../../recoil/store";

export default function IncomeInsertModal({ setDataInsert, date, sortBydate }) {
  const [incomeHeaders] = useRecoilState(incomeHeadersState);
  const [incomeData, setIncomeData] = useRecoilState(incomeDataState);
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModal, setAlertModal] = useState(false);

  const handleForm = (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const body = {};
    for (const [key, value] of form.entries()) {
      body[key] = value;
    }

    let uniqueID;
    do {
      uniqueID = generateRandomID();
    } while (!isIDUnique(uniqueID, incomeData));

    const data = {
      id: uniqueID,
    };

    let total = 0;

    for (const header of incomeHeaders) {
      let value = body[header.key];
      if (header.type === "number" && header.key !== "total") {
        if (!/^-?\d*\.?\d+$/.test(value) || Number(value) < 0) {
          setAlertModal(true);
          setAlertMessage(`Error: Invalid value for ${header.label}`);
          return;
        }
        value = Number(value);
        if (header.role === "+") {
          total += value;
        } else if (header.role === "-") {
          total -= value;
        }
      }
      data[header.key] = value;
    }

    data["total"] = parseFloat(total.toFixed(2));

    sortBydate([...incomeData, data], setIncomeData, "ascending");
    setDataInsert(false);
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  return (
    <>
      <form className="income-input-container animation" onSubmit={handleForm}>
        <div className="income-input-close">
          <button
            className="income-input-closebtn"
            type="button"
            onClick={() => setDataInsert(false)}
          >
            X
          </button>
        </div>

        <h2 className="income-input-header">Insert Income</h2>

        <section className="income-input-form">
          {incomeHeaders.map((header) => (
            <Fragment key={header.key}>
              {header.key !== "total" && (
                <div className="income-input-box">
                  <input
                    className="income-input"
                    id={header.key}
                    name={header.key}
                    type={header.type}
                    placeholder={header.label}
                    required
                    defaultValue={header.type === "date" ? `${date}-01` : ""}
                    step={header.type === "number" ? "0.01" : undefined}
                    min={header.type === "number" ? "0" : undefined}
                    onWheel={header.type === "number" ? handleWheel : undefined}
                  />
                  <label htmlFor={header.key}>{header.label}</label>
                </div>
              )}
            </Fragment>
          ))}

          <button type="submit" className="item-input-submit-button">
            SUBMIT
          </button>
        </section>
      </form>

      {isAlertModal && (
        <AlertModal setAlertModal={setAlertModal} message={alertMessage} />
      )}
    </>
  );
}
