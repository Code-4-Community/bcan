import { useNavigate } from "react-router-dom"


const UploadSucess = (): JSX.Element => {
    const navigate = useNavigate()

    return(
        <div className="center_screen">
            <p>Grant has been uploaded</p>
            <button onClick={() => {navigate('/upload-success'); console.log("bruh")}}>Return To Dashboard</button>
        </div>
    )
}



export default UploadSucess