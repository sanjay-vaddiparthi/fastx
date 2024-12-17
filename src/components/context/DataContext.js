import { createContext, useState } from "react";

const DataContext = createContext({});

export const DataProvider = ({children})=>{
    const [buses,setBuses]=useState([]);
    // const availablebuses=(busList)=>{
    //     console.log("Available Buses:",busList)
    //     setBuses(busList);
    // }
    const [userDetails,setUserDetails]=useState("");
    const [token,setToken]=useState("");

    const [loginFlag,setLoginFlag]=useState(false);
    const [signupFlag,setSignupFlag]=useState(true);
    const [forgetFlag,setForgetFlag]=useState(false);

    const [routesFrom,setRoutesFrom] =useState([])
    const [routesTo,setRoutesTo] =useState([])

    const [userFlag,setUserFlag]=useState(false);
    const [opFlag,setOpFlag]=useState(false);
    const [adminFlag,setAdminFlag]=useState(false);
    const [bookingDetails,setBookingDetails]=useState([]);
    const [searchFlag,setSearchFlag]= useState(false);
    const [BASE_URL,setBASE_URL]=useState("http://localhost:8084")

    return(
        <DataContext.Provider value={{
            buses,setBuses,
            userDetails,setUserDetails,token,setToken,
            loginFlag,setLoginFlag,
            signupFlag,setSignupFlag,
            userFlag,setUserFlag,
            opFlag,setOpFlag,
            adminFlag,setAdminFlag,
            routesFrom,setRoutesFrom,
            routesTo,setRoutesTo,
            forgetFlag,setForgetFlag,
            bookingDetails,setBookingDetails,
            BASE_URL,
            searchFlag,setSearchFlag
        }}>
            {children}
            </DataContext.Provider>
    )
}

export default DataContext;