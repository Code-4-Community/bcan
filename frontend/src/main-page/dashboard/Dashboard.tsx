import CsvExportButton from "./CsvExportButton";

import DateFilter from "./DateFilter";
import "./styles/Dashboard.css";
import { observer } from "mobx-react-lite";
import SampleChart from "./Charts/SampleChart";
import { useEffect } from "react";
import {
  updateYearFilter,
  updateFilter,
  updateEndDateFilter,
  updateStartDateFilter,
} from "../../external/bcanSatchel/actions";

const Dashboard = observer(() => {
  // reset filters on initial render
  useEffect(() => {
    updateYearFilter(null);
    updateFilter(null);
    updateEndDateFilter(null);
    updateStartDateFilter(null);
  }, []);

  return (
    <div className="dashboard-page px-12 py-4">
      <CsvExportButton />
      <DateFilter />
      <SampleChart />
    </div>
  );
});

export default Dashboard;
