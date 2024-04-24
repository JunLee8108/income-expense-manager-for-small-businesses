import "./IncomeInsertModal.css";
import { incomeTopTabList } from "../util/data";
import { generateRandomID, isIDUnique } from "../util/assignID";

import { Fragment } from "react";

export default function IncomeInsertModal({
  setDataInsert,
  month,
  setIncomeData,
  incomeData,
}) {
  const handleForm = (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const body = {};
    for (const [key, value] of form.entries()) {
      body[key] = value;
    }

    let uniqueID;

    if (incomeData.length === 0) {
      uniqueID = generateRandomID();
    } else {
      do {
        uniqueID = generateRandomID();
      } while (!isIDUnique(uniqueID, incomeData));
    }

    const floatTotal = parseFloat(body.total);

    let floatTax;
    let floatTip;
    let floatService;

    if (body.tax === "") {
      floatTax = 0;
    } else {
      floatTax = parseFloat(body.tax);
    }

    if (body.tip === "") {
      floatTip = 0;
    } else {
      floatTip = parseFloat(body.tip);
    }

    if (body.service === "") {
      floatService = 0;
    } else {
      floatService = parseFloat(body.service);
    }

    const netTotal = parseFloat(
      (floatTotal + floatTax + floatTip - floatService).toFixed(2)
    );

    const data = {
      id: uniqueID,
      date: month,
      from: body.from,
      total: floatTotal,
      tax: floatTax,
      tip: floatTip,
      service: floatService,
      netTotal: netTotal,
      memo: body.memo.trim(),
    };

    const copy = [...incomeData];
    copy.push(data);

    setIncomeData(copy);

    // FINISH //
    setDataInsert(false);
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
          <div className="income-input-box">
            <input
              className="income-input"
              id="date"
              name="date"
              type="date"
            ></input>
            <label htmlFor="date">Date</label>
          </div>

          {/* <div className="income-input-box">
            <label htmlFor="from">Source (출처)</label>
            <select
              className="income-select"
              id="from"
              defaultValue=""
              required
              name="from"
            >
              <option value="" disabled>
                Please Choose...
              </option>
              {incomeTopTabList.map((content, index) => {
                return <option key={index}>{content}</option>;
              })}
            </select>
          </div> */}

          <div className="income-input-box">
            <input
              className="income-input"
              id="category"
              type="text"
              placeholder="Category (분류)"
              name="category"
              required
            ></input>
            <label htmlFor="category">Category (종류)</label>
          </div>

          <div className="income-input-box">
            <input
              className="income-input"
              id="item"
              type="text"
              placeholder="Item (품목)"
              name="item"
              required
            ></input>
            <label htmlFor="item">Item (품목)</label>
          </div>

          <div className="income-input-box">
            <input
              className="income-input"
              id="tax"
              placeholder="Tax $ (세금)"
              name="tax"
            ></input>
            <label htmlFor="tax">Tax (세금)</label>
          </div>

          <div className="income-input-box">
            <input
              className="income-input"
              id="total"
              placeholder="Amount $ (금액)"
              name="total"
              required
            ></input>
            <label htmlFor="total">Amount (금액)</label>
          </div>

          <div className="income-input-text-area">
            <textarea
              id="note"
              name="note"
              className="item-input-textarea"
              placeholder="Note"
            ></textarea>
            <label htmlFor="note">Notes (메모)</label>
          </div>

          <button type="submit" className="item-input-submit-button">
            SUBMIT
          </button>
        </section>
      </form>
    </>
  );
}
