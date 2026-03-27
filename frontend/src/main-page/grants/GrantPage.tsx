import GrantSearch from "./filter-bar/GrantSearch.tsx";
import { useEffect, useState } from "react";
import FilterBar from "./filter-bar/FilterBar.tsx";
import GrantItem from "./grant-view/GrantView.tsx";
import { observer } from "mobx-react-lite";
import { ProcessGrantData } from "./filter-bar/processGrantData.ts";
import GrantCard from "./grant-view/components/GrantCard.tsx";
import Button from "../../components/Button.tsx";
import EditGrant from "./edit-grant/EditGrant.tsx";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function GrantPage() {
  const [showEditGrant, setShowEditGrant] = useState(false);

  // Use ProcessGrantData reactively to get filtered grants
  const { grants } = ProcessGrantData();
  const [curId, setCurId] = useState<number | null>(null);

  const curGrant =
  grants.find((g) => g.grantId === curId) ??
  grants[0] ??
  null;

  // When the first grant in the list changes (sort/filter/initial load), show it
  const firstGrantId = grants[0]?.grantId ?? null;
  useEffect(() => {
    setCurId(grants.length > 0 ? grants[0].grantId : null);
  }, [firstGrantId]);

  return (
    <div className="grant-page w-full items-end flex flex-col h-[86vh]">
      <GrantSearch />
      <div className="flex w-full py-2 place-items-start gap-4">
        <div className="text-lg w-fit font-semibold">
            <FilterBar />
          </div>
        <Button
          text="Add"
          logo={faPlus}
          logoPosition="left"
          className="bg-primary-900 text-white rounded-full border-2 border-solid ml-auto text-sm lg:text-base"
          onClick={() => setShowEditGrant(true)}
        />
      </div>

      {curGrant ? (<div className="flex w-full gap-2 flex-1 overflow-hidden justify-between mt-4">
        <div className="flex flex-col w-[33%] overflow-y-auto mr-2">
          {grants.map((grant) => (
            <GrantCard
              key={grant.grantId}
              grant={grant}
              isSelected={curGrant?.grantId === grant.grantId}
              onClick={() => setCurId(grant.grantId)}
            />
          ))}
        </div>
        <div className="flex-1 overflow-y-auto rounded-md">
          <GrantItem grant={curGrant} />
        </div>
      </div>) : (<div className="flex w-full h-full justify-center mt-24 text-gray-500 text-2xl">
              No grants found.
            </div>)}
      <div className="hidden-features">
        {showEditGrant && (
          <EditGrant
            grantToEdit={null}
            onClose={async () => {
              setShowEditGrant(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default observer(GrantPage);
