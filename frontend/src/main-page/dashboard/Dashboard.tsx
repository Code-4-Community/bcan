import { useEffect, useState } from "react";
import DateFilter from "./DateFilter";
import SampleChart from "./SampleChart";
import "./styles/Dashboard.css";
import { updateEndDateFilter, updateFilter, updateStartDateFilter, updateYearFilter } from "../../external/bcanSatchel/actions";
import { set } from "mobx";

function Dashboard() {
  const [yearFilter, setYearFilter] = useState<number[]>([]);
  
      // update state when there is a new start/end selected
      const onChange = (years: number[]) => {
          setYearFilter(years);
          // updates the store
          updateYearFilter(years);
          console.log("store updated years to", years);
      }

      useEffect(() => {
          updateYearFilter(null);
          updateFilter(null);
          updateEndDateFilter(null);
          updateStartDateFilter(null);
      }, []);

  return (
    <div className="dashboard-page">
      <DateFilter />
      <SampleChart/>
    </div>
  );
}

export default Dashboard;
