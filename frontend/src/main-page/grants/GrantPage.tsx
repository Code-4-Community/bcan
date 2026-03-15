import GrantSearch from "./filter-bar/GrantSearch.tsx";
import { useEffect, useState } from "react";
import { Grant } from "../../../../middle-layer/types/Grant.ts";
import GrantItem from "./grant-view/GrantView.tsx";
import { observer } from "mobx-react-lite";
import { ProcessGrantData } from "./filter-bar/processGrantData.ts";
import GrantCard from "./grant-view/GrantCard.tsx";
import Button from "../../components/Button.tsx";
import EditGrant from "./edit-grant/EditGrant.tsx";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

// still needed potentially?
interface GrantPageProps {
  showOnlyMyGrants?: boolean; //if true, filters grants by user email
}

function GrantPage({}: GrantPageProps) {
  const [showEditGrant, setShowEditGrant] = useState(false);

  // Use ProcessGrantData reactively to get filtered grants
  const { grants } = ProcessGrantData();
  const [curGrant, setCurGrant] = useState<Grant | null>(null);

  // Set the first grant when grants are loaded (only on initial mount)
  useEffect(() => {
    if (!grants.length) return;

    const updated = grants.find((g) => g.grantId === curGrant?.grantId);
    setCurGrant(updated ?? grants[0]);
  }, [grants]);

  return (
    <div className="grant-page w-full items-end flex flex-col h-[86vh]">
      <GrantSearch />
      <div className="flex w-full justify-between py-2 gap-4">
        <Button
          text="Filters Coming Soon"
          onClick={() => {}}
          className="border-2 border-grey-500 bg-white"
        />
        <Button
          text="Add"
          logo={faPlus}
          logoPosition="left"
          className="bg-primary-900 text-white rounded-full border-2 border-solid"
          onClick={() => setShowEditGrant(true)}
        />
      </div>

      <div className="flex w-full gap-2 flex-1 overflow-hidden justify-between mt-4">
        <div className="flex flex-col w-[33%] overflow-y-auto mr-2">
          {grants.map((grant) => (
            <GrantCard
              key={grant.grantId}
              grant={grant}
              isSelected={curGrant?.grantId === grant.grantId}
              onClick={() => setCurGrant(grant)}
            />
          ))}
        </div>
        <div className="flex-1 overflow-y-auto rounded-md">
          {curGrant ? (
            <GrantItem grant={curGrant} />
          ) : (
            <div className="flex h-full justify-center mt-24 text-gray-500 text-2xl">
              No grants found.
            </div>
          )}
        </div>
      </div>
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
