
import DateFilter from "./DateFilter";
import SampleChart from "./SampleChart";
import "./styles/Dashboard.css";
import { observer } from "mobx-react-lite";
import { useProcessGrantData } from "../grants/filter-bar/processGrantData";

const Dashboard = observer(() => {

  return (
    <div className="dashboard-page">
      <DateFilter />
      <SampleChart/>
    </div>
  );
})

export default Dashboard;
