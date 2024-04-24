import "./IncomeManager.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function IncomeManager({ incomeData }) {
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // console.log(incomeData);

  return (
    <>
      <div className="income-container animation">
        <h1 className="income-main-header">2024 November</h1>

        <section className="income-card-container">
          {incomeData.map((data, index) => (
            <div key={index} className="income-card">
              <h2 style={{ backgroundColor: getRandomColor() }}>{data.from}</h2>
              {/* <h2>{data.from}</h2> */}
              <div className="income-card-content">
                <p>Date: {data.date}</p>
                <p>Net Total: ${data.netTotal}</p>
                <p>Service: ${data.service}</p>
                <p>Tax: ${data.tax}</p>
                <p>Tip: ${data.tip}</p>
                <p>Total: ${data.total}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
