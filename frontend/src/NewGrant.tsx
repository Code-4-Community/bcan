import React, { useState, useRef } from 'react';
import './NewGrant.css'
import POCEntry from './POCEntry';

type POCEntryRef = {
    getPOC: () => string;
};


const NewGrant = (): JSX.Element => {
    const [orgName, changeOrgName] = useState<string>("")
    const [desc, changeDesc] = useState<string>("")
    // On submission make sure that you check if its yes or no
    const [qual, changeIsQualifying] = useState<string>("")
    const [status, changeStatus] = useState<string>("")
    const [amt, changeGrantAmount] = useState<number>(0)
    // const [deadline, changeDeadline] = useState(new Date())
    const [notifactions, changeNotificationStatus] = useState<string>("")
    const [restrictions, changeRestrictions] = useState<string>("")
    // // poc = point of contact
    const [pocComponents, setPOCComponentList] = useState<JSX.Element[]>([])
    const [pocRefs, setPOCRefs] = useState<React.RefObject<POCEntryRef>[]>([])
    const [resources, changeResources] = useState<string>("")
    const [comments, changeComments] = useState<string>("")
    const [errMessage, changeErrorMessage] = useState<string>("")
    const [showErr, changeShowError] = useState<boolean>(false)

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
        }

        return true
    }
    const convertYNToBoolean = (val: string, changeFunc: Function) => {
        if (val.toLowerCase() === "yes") {
            changeFunc(true)
        }
        else {
            changeFunc(false)
        }
    }

    const submitGrant = () => {
        if (!validInputs()) {
            return
        }
        const grantStatus = (status === "Unarchived") ? true : false;
        const pocList : string[] = []
        pocRefs.forEach(ref => {
            pocList.push(ref.current.getPOC())
        })
        const grantJson = {
            orgName: orgName.trim(),
            description: desc.trim(),
            resources: resources.trim(),
            status: grantStatus,
            grantQualify: convertYNToBoolean(qual, changeIsQualifying),
            amount : amt,
            notifactions : convertYNToBoolean(notifactions,changeNotificationStatus),
            restrictions : restrictions.trim(),
            comments : comments.trim(),
            pocs: pocList
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