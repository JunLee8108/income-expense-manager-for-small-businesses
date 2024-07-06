import "./Loading.css";

import HashLoader from "react-spinners/HashLoader";

export default function Loading() {
  return (
    <>
      <div className="loading-container-bg">
        <div className="loading-container">
          <HashLoader color="#3b853b" />
        </div>
      </div>
    </>
  );
}
