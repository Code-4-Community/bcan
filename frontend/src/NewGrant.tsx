import React, { useState } from 'react';
// import { observer } from 'mobx-react-lite';
import './NewGrant.css'

const NewGrant = () => {
    const [orgName, changeOrgName] = useState("")
    const [desc, changeDesc] = useState("")
    // On submission make sure that you check if its yes or no
    const [qual, changeIsQualifying] = useState("")
    const [status, changeStatus] = useState("")
    const [amt, changeGrantAmount] = useState(0)
    // const [deadline, changeDeadline] = useState(new Date())
    const [notifactions, changeNotificationStatus] = useState("")
    const [restrictions, changeRestrictions] = useState("")
    // // poc = point of contact
    // const [poc, changePOC] = useState([])
    // const [resources, changeResources] = useState([])
    // const [commnets, changeComments] = useState([])
    // const [isArchived, changeArchiveStatus] = useState(false)
    console.log(orgName)

    const convertYesNo = (str) => {
        if(str === "yes"){
            return true
        }
        else if (str === "no"){
            return false
        }
    }

    // const handleNewDate  = (event) =>{
        
    //     changeDeadline()
    // }




    return (<div className="center_screen">
        <div className='main_div'>
            <p> Organzation Name </p>
            <input type="text"
                onChange={(e) => changeOrgName(e.target.value)}>
            </input>
            <p>Description</p>
            <input type="text"
                onChange={(e) => changeDesc(e.target.value)}>
            </input>
            <label htmlFor="yesNo">Does the Grant Qualify? </label>
            <select id="yesNo" value= {qual} onChange={(e) => changeIsQualifying(e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>
            <label htmlFor="yesNo">What is the grants Status? </label>
            <select id="yesNo" value= {status} onChange={(e) => changeStatus(e.target.value)}>
                <option value="Unarchived">Unarchived</option>
                <option value="Archived">Archived</option>
            </select>
            <p>Grant Amount</p>
            <input type="number"
                onChange={(e) => changeGrantAmount(Number(e.target.value))}>
            </input>
            <label htmlFor="yesNo">Turn on Notifications? </label>
            <select id="yesNo" value= {notifactions} onChange={(e) => changeNotificationStatus(e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>
            <p>Restrictions</p>
            <input type="text"
                onChange={(e) => changeRestrictions(e.target.value)}>
            </input>



        </div>
    </div>)
}


export default NewGrant;