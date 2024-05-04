import "./ChartModal.css";

import { Bar } from "react-chartjs-2";
// eslint-disable-next-line
import Chart from "chart.js/auto";

export default function ChartModal({
  propsChartData,
  modalHeader,
  setModal,
  chartOptions,
}) {
  return (
    <>
      <div className="chart-modal-bg flash">
        <div
          className="dashboard-bar-container"
          onClick={() => setModal(false)}
        >
          <h3 className="dashboard-chart-subheader">{modalHeader}</h3>
          <Bar data={propsChartData} options={chartOptions} />
        </div>
      </div>
    </>
  );
}
