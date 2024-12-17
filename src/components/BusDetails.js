import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Tabs, Input, message } from "antd";
import axios from "axios";
import DataContext from "./context/DataContext";
import { useNavigate} from "react-router-dom";
import Header from './Header'
import Footer from './Footer';

const BusDetails = () => {
    const {userDetails}=useContext(DataContext);
  const [currentTab, setCurrentTab] = useState("current"); 
  const [busData, setBusData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const nav =useNavigate()

  const BASE_URL = "http://localhost:8084/"; 
  
  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}bus/op/getbus/${userDetails.userName}`,{
            headers: { Authorization: `Bearer ${userDetails.jwt} `},
          })
            const currentDate = new Date();
            console.log("Operator Bus Details",response.data)

        const filtered = response.data.filter((bus) => {
          const journeyDate = new Date(bus.date);
          return currentTab === "current"
            ? journeyDate >= currentDate 
            : journeyDate < currentDate; 
        });

        setBusData(filtered);
        setFilteredData(filtered); 
        console.log("filtered Data",filtered)
      } catch (err) {
        message.error("Error fetching bus details");
      }
    };
    fetchBusDetails();
  }, [currentTab]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = busData.filter((bus) =>
      bus.busName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleBooking = (bus) => {
    nav("/managebookings",{state:{bus}})

};

  const columns = [
    { title: "Bus Name", dataIndex: "busName", key: "busName" },
    { title: "Bus Number", dataIndex: "busNumber", key: "busNumber" },
    {
      title: "Source",
      dataIndex: "route",
      key: "source",
      render: (route) => route.routeFrom, 
    },
    {
      title: "Destination",
      dataIndex: "route",
      key: "destination",
      render: (route) => route.routeTo, 
    },
    { title: "Journey Date", dataIndex: "date", key: "date" },
    {
      title: "Seats",
      key: "seats",
      render: (record) =>
        `${record.availableSeats}/${record.totalSeats}`, 
    },
    { title: "Bus Type", dataIndex: "busType", key: "busType" },
    {
      title: "", 
      key: "booking",
      render: (record) => (
        <Button type="primary" onClick={() => handleBooking(record)}>
          Booking
        </Button>
      ),
    },
  ];

  return (
    <>
    <Header/>
    <div style={{ padding: "20px" }}>
      <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
      <Tabs
      style={{margin:"10px 0px 0 40px", fontWeight:"600"}}
        defaultActiveKey="current"
        onChange={(key) => setCurrentTab(key)}
        items={[
          { label: "Current", key: "current" },
          { label: "Past", key: "past" },
        ]}
      />

      <Input
        placeholder="Search by bus name"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        style={{  width: "400px",marginLeft:"35px", height:"35px" }}
      />
      </div>

      <Table columns={columns} dataSource={filteredData} rowKey="id" />
    </div>
    <Footer/>
    </>
    
  );
};

export default BusDetails;