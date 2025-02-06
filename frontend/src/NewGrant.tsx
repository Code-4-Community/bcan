import React, { useState } from 'react';
import './NewGrant.css'
import POCEntry from './POCEntry';
import { useNavigate } from 'react-router-dom';

type POCEntryRef = {
    getPOC: () => string;
};

// TODO need to change the string[] fields to have multiple inputs to make the array
const NewGrant = (): JSX.Element => {
    const [orgName, changeOrgName] = useState<string>("")
    const [desc, changeDesc] = useState<string>("")
    // On submission make sure that you check if its yes or no
    const [qual, changeIsQualifying] = useState<string>("")
    const [status, changeStatus] = useState<string>("")
    const [amt, changeGrantAmount] = useState<number>(0)
    const [deadline, changeDeadline] = useState("")
    const [notifactions, changeNotificationStatus] = useState<string>("")
    const [restrictions, changeRestrictions] = useState<string>("")
    // // poc = point of contact
    const [pocComponents, setPOCComponentList] = useState<JSX.Element[]>([])
    const [pocRefs, setPOCRefs] = useState<React.RefObject<POCEntryRef>[]>([])
    const [resources, changeResources] = useState<string>("")
    const [comments, changeComments] = useState<string>("")
    const [errMessage, changeErrorMessage] = useState<string>("")
    const [showErr, changeShowError] = useState<boolean>(false)
    // const [grantUploaded, changeGrantUploaded] = useState<boolean>(false)
    const [repReq, changeReportingReqs] = useState<string>("")
    const navigate = useNavigate();

    const addPOC = () => {
        console.log("added component")
        const curRef = React.createRef<POCEntryRef>();
        const pocComp = <POCEntry ref={curRef} key={pocComponents.length} />

        setPOCComponentList([...pocComponents, pocComp])
        setPOCRefs([...pocRefs, curRef])
    }


    function validInputs(): boolean {
        if (!orgName) {
            changeErrorMessage("Please enter an organization name")
            changeShowError(true)
            return false;
        }
        else if (!desc) {
            changeErrorMessage("Please describe the grant in the description")
            changeShowError(true)
            return false
        } else if (!restrictions) {
            changeErrorMessage("Please enter restrictions if none enter N/A")
            changeShowError(true)
            return false
        } else if (!resources) {
            changeErrorMessage("Please enter resources if none enter N/A")
            changeShowError(true)
            return false
        } else if (!comments) {
            changeErrorMessage("Please enter comments if none enter N/A")
            changeShowError(true)
            return false
        } else if (amt <= 0) {
            changeErrorMessage("Please a non zero amount for the grant")
            changeShowError(true)
            return false
        }else if (!deadline) {
            changeErrorMessage("Please enter a date")
            changeShowError(true)
            return false
        } 

        return true
    }
    const convertYNToBoolean = (val: string, changeFunc:  ((a: boolean ) => unknown)) => {
        if (val.toLowerCase() === "yes") {
            changeFunc(true)
        }
        else {
            changeFunc(false)
        }
    }

    const handleDeadlineChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        changeDeadline(event.target.value)
        console.log(deadline)
    }

    const submitGrant =  async () => {
        if (!validInputs()) {
            return
        }
        const pocList : string[] = []
        pocRefs.forEach(ref => {
            pocList.push(ref.current.getPOC())
        })
        const resourcesArr = Array.of(resources.trim())
        const grantJson = {
            orgName: orgName.trim(),
            description: desc.trim(),
            attached_resources: resourcesArr,
            status: status,
            is_bcan_qualifying: convertYNToBoolean(qual, changeIsQualifying),
            amount : amt,
            notifications_on_for_user : convertYNToBoolean(notifactions,changeNotificationStatus),
            restrictions : restrictions.trim(),
            comments : comments.trim(),
            point_of_contacts: pocList,
            deadline: deadline,
            reporting_requirements: repReq
        }

        try {
            const response = await fetch('http://localhost:3001/grant/new-grant',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(grantJson)
            })

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Grant upload failed.');
                return;
              }
            navigate('/upload-success');


        } catch (error) {
            changeShowError(true)
            changeErrorMessage("Server Error")
            console.log(error)
            return
        }

    } 



    // TODO : CSS problem where when i move the text area the orgname goes off the screen
    return (
        <div className="center_screen">
            <div className='main_div'>
                <p> Organization Name </p>
                <textarea
                    onChange={(e) => changeOrgName(e.target.value)}>
                </textarea>
                <p>Description</p>
                <textarea
                    onChange={(e) => changeDesc(e.target.value)}>
                </textarea>
                <p>Reporting Requirements</p>
                <textarea
                    onChange={(e) => changeReportingReqs(e.target.value)}>
                </textarea>
                <p>Resources</p>
                <textarea
                    onChange={(e) => changeResources(e.target.value)}>
                </textarea>
                <label htmlFor="yesNo">Does the Grant Qualify? </label>
                <select id="yesNo" value={qual} onChange={(e) => changeIsQualifying(e.target.value)}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
                <label htmlFor="yesNo">What is the grants Status? </label>
                <select id="yesNo" value={status} onChange={(e) => changeStatus(e.target.value)}>
                    <option value="Unarchived">Unarchived</option>
                    <option value="Archived">Archived</option>
                </select>
                <p>Grant Amount</p>
                <input type="number"
                    onChange={(e) => changeGrantAmount(Number(e.target.value))}>
                </input>
                <p>Deadline</p>
                <input type='date' value={deadline} onChange={handleDeadlineChange}></input>
                <label htmlFor="yesNo">Turn on Notifications? </label>
                <select id="yesNo" value={notifactions} onChange={(e) => changeNotificationStatus(e.target.value)}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
                <p>Restrictions</p>
                <textarea
                    onChange={(e) => changeRestrictions(e.target.value)}>
                </textarea>
                <p> Comments </p>
                <textarea
                    onChange={(e) => changeComments(e.target.value)}>
                </textarea>
                <p>Points of Contact</p>
                {pocComponents.map(entry => (
                    entry
                ))}
                <div>
                    <button onClick={addPOC}>Add POC </button>
                    <button onClick={() => {
                        setPOCComponentList(pocComponents.slice(0, -1));
                        setPOCRefs(pocRefs.slice(0, -1))
                    }}>Delete POC</button>
                </div>
                {showErr && <p>{errMessage}</p>}
                <button onClick={submitGrant}>Submit Grant</button>
            </div>
        </div>)
}


export default NewGrant;