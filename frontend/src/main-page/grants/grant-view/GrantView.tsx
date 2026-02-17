import React, { useEffect, useState, useLayoutEffect } from "react";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { api } from "../../../api";
import { observer } from "mobx-react-lite";
import StatusIndicator from "../../grants/grant-list/StatusIndicator";
import {
  faPenToSquare,
  faCheckSquare,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../../settings/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ContactCard from "./ContactCard";
import GrantFieldCol from "./GrantFieldCol";

interface GrantItemProps {
  grant: Grant;
}

const GrantItem: React.FC<GrantItemProps> = observer(({ grant }) => {
  const [curGrant, setCurGrant] = useState(grant);
  const [wasGrantSubmitted, setWasGrantSubmitted] = useState(false);

  const useTruncatedElement = ({
    ref,
  }: {
    ref: React.RefObject<HTMLElement>;
  }) => {
    const [isTruncated, setIsTruncated] = useState(false);
    const [isShowingMore, setIsShowingMore] = useState(false);

    useLayoutEffect(() => {
      const { offsetHeight, scrollHeight } = ref.current || {};

      if (offsetHeight && scrollHeight && offsetHeight < scrollHeight) {
        setIsTruncated(true);
      } else {
        setIsTruncated(false);
      }
    }, [ref]);

    const toggleIsShowingMore = () => setIsShowingMore((prev) => !prev);

    return {
      isTruncated,
      isShowingMore,
      toggleIsShowingMore,
    };
  };
  const ref = React.useRef(null);
  const { isTruncated, isShowingMore, toggleIsShowingMore } =
    useTruncatedElement({
      ref,
    });

  // If the NewGrantModal has been closed and a new grant submitted (or existing grant edited),
  // fetch the grant at this index so that all new changes are immediately reflected
  useEffect(() => {
    const updateGrant = async () => {
      if (wasGrantSubmitted) {
        try {
          const response = await api(`/grant/${grant.grantId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const updatedGrant = await response.json();
            setCurGrant(updatedGrant);
            console.log("✅ Grant refreshed:", updatedGrant);
          } else {
            console.error("❌ Failed to fetch updated grant");
          }
        } catch (err) {
          console.error("Error fetching updated grant:", err);
        }
        setWasGrantSubmitted(false);
      }
    };

    updateGrant();
  }, [wasGrantSubmitted]);

  function formatDate(isoString: string): string {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  function formatCurrency(amount: number): string {
    const formattedCurrency = new Intl.NumberFormat().format(amount);
    return formattedCurrency;
  }

  return (
    <div className="w-full bg-white rounded-md flex flex-col gap-6 p-6">
      {/* Top header part */}
      <div className="flex justify-between">
        {/* Left side */}
        <div className="flex flex-col gap-2 items-start text-left">
          <h2 className="text-2xl font-semibold">{curGrant.organization}</h2>
          <StatusIndicator curStatus={curGrant.status} />
        </div>
        {/* Right side */}
        <div className="flex flex-col gap-2 items-end">
          <Button
            text="Edit"
            onClick={() => alert("edit personal info")}
            className="bg-white text-black border-2 border-grey-500"
            logo={faPenToSquare}
            logoPosition="right"
          />
        </div>
      </div>
      <hr className="border-grey-400 border-t-2 rounded-full" />

      {/* Middle info part */}
      <div className="flex flex-col gap-6 items-start text-left">
        {/* Description */}
        <GrantFieldCol
          fields={[
            {
              label: "Description",
              item: (
                <div>
                  <p
                    ref={ref}
                    className={` ${!isShowingMore && "line-clamp-3"}`}
                    onClick={toggleIsShowingMore}
                  >
                    {curGrant?.description || "N/A"}
                  </p>
                  {isTruncated && (
                    <button
                      className="text-secondary"
                      onClick={toggleIsShowingMore}
                    >
                      {isShowingMore ? "Show less" : "show more"}
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
        {/* Other details */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full gap-4">
          <GrantFieldCol
            fields={[
              {
                label: "Amount ($)",
                value: formatCurrency(curGrant.amount),
                important: true,
              },
              {
                label: "BCAN Eligible",
                important: true,
                item: curGrant.does_bcan_qualify ? (
                  <span className="text-green">
                    <FontAwesomeIcon icon={faCheckSquare} /> Yes
                  </span>
                ) : (
                  <span className="text-red">
                    <FontAwesomeIcon icon={faCheckSquare} /> No
                  </span>
                ),
              },
            ]}
          />
          <GrantFieldCol
            fields={[
              {
                label: "Due Date",
                important: true,
                value: formatDate(curGrant.application_deadline),
              },
              {
                label: "Application Date",
                value: formatDate(curGrant.application_deadline),
              },
            ]}
          />
          <GrantFieldCol
            fields={[
              {
                label: "Grant Start Date",
                value: formatDate(curGrant.grant_start_date),
              },
              {
                label: "Report Deadlines",
                item:
                  curGrant.report_deadlines &&
                  curGrant.report_deadlines.length > 0 ? (
                    curGrant.report_deadlines.map(
                      (deadline: string, index: number) => (
                        <div key={index} className="text-black">
                          {formatDate(deadline)}
                        </div>
                      ),
                    )
                  ) : (
                    <div className="">N/A</div>
                  ),
              },
            ]}
          />
          <GrantFieldCol
            colspan={2}
            fields={[
              {
                label: "Timeline (years)",
                value: curGrant.timeline,
              },
              {
                label: "Estimated Completion Time (hours)",
                value: curGrant.estimated_completion_time,
              },
            ]}
          />
        </div>
      </div>
      <hr className="border-grey-400 border-t-2 rounded-full" />

      {/* Bottom info */}
      <div className="flex flex-col gap-6 items-start text-left">
        {/* Contacts */}
        <GrantFieldCol
          fields={[
            {
              label: "Contacts",
              item: (
                <div className="grid grid-cols-1 xl:grid-cols-2 w-full h-full lg:w-[90%] gap-4">
                  <ContactCard contact={grant.bcan_poc} type="BCAN" />
                  <ContactCard contact={grant.grantmaker_poc} type="Granter" />
                </div>
              ),
            },
          ]}
        />
        {/* Documents */}
        <GrantFieldCol
          fields={[
            {
              label: "Documents",
              item:
                curGrant.attachments && curGrant.attachments.length > 0 ? (
                  <div className="columns-2 xl:columns-4 gap-4 lg:w-[90%]">
                    {curGrant.attachments.map((attachment, index) => (
                      <p key={index} className="text-sm truncate w-full mb-1">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary font-medium text-sm underline"
                        >
                          {attachment.attachment_name || attachment.url}
                        </a>
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="">N/A</div>
                ),
            },
          ]}
        />
      </div>
    </div>
  );
});

export default GrantItem;
