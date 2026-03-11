import { useState } from "react";
import Button from "../../../components/Button.tsx";
import { faCheckSquare, faSquareXmark, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function EditGrant() {
  const [bcanEligible, setBcanEligible] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const buttonOptions = [
    { id: "button1", label: "Active" },
    { id: "button2", label: "Pending" },
    { id: "button3", label: "Potential" },
    { id: "button4", label: "Rejected" },
    { id: "button5", label: "Inactive" },
  ];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header with Buttons */}
            <div className="flex justify-between items-start mb-4">
              <div className="w-1/2 mr-4">
                <textarea className="block w-full text-gray-700 text-2xl border-2 border-grey-300 rounded placeholder:text-gray-700 p-3 font-bold min-h-[60px] resize-none" placeholder="Enter your Grant Name" onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} />
              </div>
              <div className="flex space-x-4">
                <Button
                    text="Cancel"
                    className="border-2 border-grey-300"
                    onClick={() => alert("Cancel clicked")}
                />
                <Button
                    text="Save"
                    className="bg-primary-900 text-gray-700 px-3 py-1 text-sm"
                    onClick={() => alert("Save clicked")}
                />
              </div>
            </div>

            {/* 5 Horizontal Buttons */}
            <div className="flex space-x-2 mt-4">
              {buttonOptions.map((btn) => (
                <Button
                  key={btn.id}
                  text={btn.label}
                  className={`text-gray-700 px-3 py-1 text-sm border-2 ${status === btn.id ? "bg-primary-800 border-primary-800" : "border-grey-300"}`}
                  onClick={() => setStatus(btn.id)}
                />
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-grey-300 my-6"></div>

            {/* Description */}
            <div className="w-1/2 mt-4">
                <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
                    Description
                </label>
                <textarea className="h-48 block w-full text-gray-700 border border-grey-300 rounded placeholder:text-gray-700 p-2" placeholder="Enter Grant Description" />
                </div>
            <div className="flex mt-5 items-start">
              {/* Left Column */}
              <div className="w-1/3 pr-9">
                {/* Amount */}
                <div className="w-1/2 mb-4">
                  <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="text"
                    className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
                  />
                </div>

                {/* BCAN Eligible */}
                <div className="w-1/4">
                  <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1 whitespace-nowrap">
                    BCAN Eligible?
                  </label>
                  <div className="flex flex-col space-y-2">
                    <Button
                      logo={faCheckSquare}
                      logoPosition="left"
                      text="Yes"
                      className={`text-gray-700 px-3 py-1 text-sm border-2F ${bcanEligible === "yes" ? "bg-primary-800 border-primary-800" : "border-grey-300"}`}
                      onClick={() => setBcanEligible("yes")}
                    />
                    <Button
                      logo={faSquareXmark}
                      logoPosition="left"
                      text="No"
                      className={`text-gray-700 px-3 py-1 text-sm border-2 ${bcanEligible === "no" ? "bg-primary-800 border-primary-800" : "border-grey-300"}`}
                      onClick={() => setBcanEligible("no")}
                    />
                  </div>
                </div>
              </div>

              {/* Center Column - Dates */}
              <div className="w-1/6 px-2 -ml-44">
                {/* Due Date */}
                <div className="mb-4">
                  <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
                  />
                </div>
                {/* Application Date */}
                <div className="mb-4">
                  <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
                    Application Date
                  </label>
                  <input
                    type="date"
                    className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="w-1/3 pl-7">
                <div className="grid grid-cols-2 gap-4 ">
                  {/* Grant Start Date */}
                  <div>
                    <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
                      Grant Start Date
                    </label>
                    <input
                      type="date"
                      className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
                    />
                  </div>

                  {/* Estimated Completion Time */}
                  <div className="pl-7">
                    <label className="flex text-gray-700 text-s mb-1 whitespace-nowrap">
                      Estimated Completion Time (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
                    />
                  </div>
                  
                  {/* Report Deadlines */}
                  <div>
                    <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1 ">
                      Report Deadlines
                    </label>
                    <input
                      type="date"
                      className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4 "
                    />
                  </div>

                  {/* Timeline */}
                  <div className="pl-7">
                    <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1 ">
                      Timeline (years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-grey-300 my-4"></div>

            {/* Contacts and Documents Section */}
            <div className="flex space-x-4 items-start">
              {/* Left Column - Contacts and Documents */}
              <div className="w-1/2 pr-3">
                {/* Contacts */}
                <div className="w-1/2 mb-4">
                  <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
                    Contacts
                  </label>
                  <textarea className="h-36 block w-full text-gray-700 border border-grey-300 rounded-md placeholder:text-gray-700 p-2" placeholder="Enter Contacts" />
                </div>

                {/* Documents */}
                <div className="w-1/2">
                  <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
                    Documents
                  </label>
                  <Button
                    logo={faPlus}
                    logoPosition="left"
                    text="Add"
                    className="bg-white text-gray-700 border border-grey-300"
                    onClick={() => alert("Add document clicked")}
                  />
                </div>
              </div>
            </div>

        </div>
    </div>
  );
}
