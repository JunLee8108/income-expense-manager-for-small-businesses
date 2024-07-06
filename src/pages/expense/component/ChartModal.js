import "./ChartModal.css";
import useBodyScrollLock from "../../../component/common/useBodyScrollLock";

import { Bar } from "react-chartjs-2";
// eslint-disable-next-line
import Chart from "chart.js/auto";

import { useEffect } from "react";

export default function ChartModal({
  propsChartData,
  modalHeader,
  setModal,
  chartOptions,
}) {
  const closeModal = () => {
    setModal(false);
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px";
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="chart-modal-bg flash">
        <div
          className="dashboard-bar-container bar-container-modal"
          onClick={closeModal}
        >
          <h3 className="dashboard-chart-subheader">{modalHeader}</h3>
          <Bar data={propsChartData} options={chartOptions} />
        </div>
      </div>
    </>
  );
}
