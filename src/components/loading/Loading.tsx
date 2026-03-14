import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import CustomButton from "../customButton/CustomButton"

interface Props{
    showGoHome?:boolean;
    text?:string;
}
const Loading = ({showGoHome,text="Loading..."}:Props) => {
    const [goHome, setGoHome] = useState<boolean>(false)
    const navigate = useNavigate()
    useEffect(() => {
        const timer = setTimeout(() => {
            setGoHome(true)
        }, 3000)
        return () => {
            clearTimeout(timer)
        }
    }, [])
    return (
        <>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-100 bg-black bg-opacity-20">
                <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium">{text}</p>
                {
                    // goHome && 
                    showGoHome &&
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-full mt-5 transition-all duration-500"
                        style={{
                            opacity:goHome?1:0,
                            marginTop:goHome?'1.5rem':'0'
                        }}  
                    >
                        <CustomButton 
                            label="Go Home Page"
                            onClick={()=>{
                                navigate("/")
                                window.location.reload()
                            }}
                        />
                    </div>
                }
            </div>
        </>

    )
}

export default Loading;