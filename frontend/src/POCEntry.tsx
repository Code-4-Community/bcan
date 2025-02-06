import React, { forwardRef, useImperativeHandle, useState } from 'react';
import "./NewGrant.css"

// TODO: Might want to add in a package to have a phone number so no valadiation is needed
const POCEntry = forwardRef((props, ref) => {
    const [poc, changePOC] = useState("")
    const [pocType, changePOCType] = useState("")
    const [inputType, changeInputType] = useState("text")
    // This is from chat so idk what this will always do
    // TODO: make it so has to be type and then colon then value 
    useImperativeHandle(ref, () => ({
        getPOC: () => {
            return `${pocType}: ${poc}`
        }
    }));

    const handlePOCType = (event) => {
        const val = event.target.value
        changePOCType(val)

        if (val === "Email") {
            changeInputType("email")
            changePOC("")
        } else if (val === "Phone Number") {
            changeInputType("number")
            changePOC("0")
        }
        else {
            changeInputType("text")
        }
    }

    // make inputs for email, phone number, for now and possibly more

    return (<div className='row-container'>
        <select id="yesNo" value={pocType} onChange={handlePOCType}>
            <option value="Email">Email</option>
            <option value="Phone Number">Phone Number</option>
        </select>
        <input type={inputType} value={poc} onChange={(e) => { changePOC(e.target.value) }}>
        </input>

    </div>)
})


export default POCEntry