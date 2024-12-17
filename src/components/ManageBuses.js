import React, { useState, useEffect, useContext } from "react";
import { Select,Form,Modal,Table, Button, Tabs, Input, message,AutoComplete } from "antd";
import axios from "axios";
import DataContext from "./context/DataContext";
import { useNavigate} from "react-router-dom";
import Header from './Header'
import Footer from './Footer';

const ManageBuses = () => {
    const {routesFrom,setRoutesFrom,routesTo,setRoutesTo, userDetails } = useContext(DataContext);
    const [currentTab, setCurrentTab] = useState("current"); 
    const [busData, setBusData] = useState([]); 
    const [filteredData, setFilteredData] = useState([]); 
    const [searchTerm, setSearchTerm] = useState(""); 
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingBus, setEditingBus] = useState(null); 
    const [routeDetails, setRouteDetails] = useState({}); 
    const [form] = Form.useForm();
    const {Option}= Select
    const [routeForm] = Form.useForm(); 
    const nav = useNavigate();
    const [sourceOptions, setSourceOptions] = useState([]);
    const [destinationOptions, setDestinationOptions] = useState([]);
  
    const BASE_URL = "http://localhost:8084/"; 

    useEffect(() => {
      
      fetchBusDetails();
    }, []);

    useEffect(() => {
      fetchBusDetails();
    }, [currentTab]);



    const fetchBusDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}bus/op/getbus/${userDetails.userName}`, {
          headers: { Authorization: `Bearer ${userDetails.jwt}` },
        });
        const currentDate = new Date();
        const filtered = response.data.filter((bus) => {
          const journeyDate = new Date(bus.date);
          journeyDate.setHours(0,0,0,0);
          currentDate.setHours(0,0,0,0)
          // console.log(bus)
          // console.log(journeyDate);
          // console.log(currentDate);
          return currentTab === "current"
            ? journeyDate >= currentDate 
            : journeyDate < currentDate; 
        });
        setBusData(filtered);
        setFilteredData(filtered); 
      } catch (err) {
        message.error("Error fetching bus details");
      }
    };

    const handleSourceChange = (value) => {
      const filteredOptions = routesFrom.filter((route) =>
        route.toLowerCase().includes(value.toLowerCase())
      );
      setSourceOptions(filteredOptions.map((route) => ({ value: route })));
    };
  
    const handleDestinationChange = (value) => {
      const filteredOptions = routesTo.filter((route) =>
        route.toLowerCase().includes(value.toLowerCase())
      );
      setDestinationOptions(filteredOptions.map((route) => ({ value: route })));
    };
    
  
    const handleSearch = (value) => {
      setSearchTerm(value);
      const filtered = busData.filter((bus) =>
        bus.busName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    };
  
    const handleOk = async () => {
        try {
          const busValues = await form.getFieldsValue();
          const routeValues = await routeForm.getFieldsValue();
      
          const routeResponse = await axios.get(`${BASE_URL}route/getall`);
          const routeExtract = routeResponse.data.filter(
            (r) => r.routeFrom === routeValues.routeFrom && r.routeTo === routeValues.routeTo
          );
      
          if (routeExtract.length === 0) {
            message.error("Route not available");
          } else {
            const routeId = routeExtract[0].routeId;
      
            if (isEditing) {
              // Update bus
              await axios.put(
                `${BASE_URL}bus/op/update/${routeId}`,
                { busId: editingBus.busId, ...busValues },
                {
                  headers: { Authorization: `Bearer ${userDetails.jwt}` },
                }
              );
              message.success("Bus updated successfully!");
            } else {
              // Add new bus
              const response =await axios.post(
                `${BASE_URL}bus/op/add/${routeId}/${userDetails.userName}`,
                busValues,
                {
                  headers: { Authorization: `Bearer ${userDetails.jwt}` },
                }
              );
              message.success("Bus added successfully!");
              const busInfo=response.data;
              await axios.post(`${BASE_URL}seat/op/addseats/${busInfo.busType.includes("SLEEPER")?"30":"36"}/${busInfo.busId}`,{},{
                headers: { Authorization: `Bearer ${userDetails.jwt}` },
              });
              message.success("Seats added successfully!");
            }
          }
      
          handleCancel(); 
        } catch (error) {
          message.error("Failed to add or update bus. Please try again.");
        }
        fetchBusDetails();
      };
      
  
    const handleEdit = (bus) => {
      setEditingBus(bus);
      setIsEditing(true);
      form.setFieldsValue(bus);
      setRouteDetails(bus.route);
      routeForm.setFieldsValue(bus.route);
      setIsModalVisible(true);
    };
  
    const handleCancel = () => {
      setIsModalVisible(false);
      form.resetFields();
      routeForm.resetFields();
      setIsEditing(false);
    };

    const handleDelete = async (id) => {
        try {
          Modal.confirm({
            title: "Are you sure you want to delete this bus?",
            onOk: async () => {
              console.log(id)
              const response =await axios.delete(`${BASE_URL}bus/op/delete/${id}`,{
                headers: { Authorization: `Bearer ${userDetails.jwt} `},
              });
              console.log(response.data)
              if(response.data.includes("Bus Deleted"))
                message.success("Bus deleted successfully!");
              else
                message.error(`Bus not deleted.Bookings are done for this bus`)
            },
          });
        } catch (error) {
          message.error("Failed to delete bus.");
        }
        console.log("in handle delete")
        fetchBusDetails();
      };
  
    const columns = [
      { title: "Bus Name", dataIndex: "busName", key: "busName" },
      { title: "Bus Number", dataIndex: "busNumber", key: "busNumber" },
      { title: "Source", dataIndex: "route", key: "source", render: (route) => route.routeFrom },
      { title: "Destination", dataIndex: "route", key: "destination", render: (route) => route.routeTo },
      { title: "Journey Date", dataIndex: "date", key: "date" },
      { title:"BusType",dataIndex:"busType",key:"busType"},
      {
        title: "Seats",
        key: "seats",
        render: (record) => `${record.availableSeats}/${record.totalSeats}`,
      },
      {title:"Timings",key:"timings",
        render:(record)=>
            `${record.arrival}-${record.departure}`
    },
    {title:"Amenities",key:"amenities",dataIndex:"amenities"},
      { title: "Actions", key: "actions", render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.busId)}>Delete</Button>
        </>
      )},
    ];
  
    return (
      <>
        <Header />
        <div style={{ padding: "20px" }}>
          <Tabs defaultActiveKey="current" onChange={(key) => setCurrentTab(key)}>
            <Tabs.TabPane tab="Current" key="current" />
            <Tabs.TabPane tab="Past" key="past" />
          </Tabs>
          <Input
            placeholder="Search by bus name"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: "300px", marginBottom: "20px" }}
          />
          <Button type="primary" onClick={() => setIsModalVisible(true)}>Add Bus</Button>
          <Table columns={columns} dataSource={filteredData} rowKey="busId" pagination={false} />
        </div>
        <Modal
          title={isEditing ? "Edit Bus" : "Add Bus"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={isEditing ? "Update" : "Add"}
          cancelText="Cancel"
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              label="Bus Name"
              name="busName"
              rules={[{ required: true, message: "Please enter Bus Name." }]}
            >
              <Input placeholder="Enter Bus Name" />
            </Form.Item>
            <Form.Item
              label="Bus Number"
              name="busNumber"
              rules={[{ required: true, message: "Please enter Bus Number." }]}
            >
              <Input placeholder="Enter Bus number" />
            </Form.Item>
            <Form.Item
              label="Arrival (24hrs - HH:MM:SS)"
              name="arrival"
              rules={[{ required: true, message: "Please enter arrival time.(24hrs - HH:MM:SS)" }]}
            >
              <Input placeholder="Enter arrival time (24hrs - HH:MM:SS)" />
            </Form.Item>
            <Form.Item
              label="Departure (24hrs - HH:MM:SS)"
              name="departure"
              rules={[{ required: true, message: "Please enter departure time. (24hrs - HH:MM:SS)" }]}
            >
              <Input placeholder="Enter departure time (24hrs - HH:MM:SS)" />
            </Form.Item>
            <Form.Item
                  label="Date (YYYY-MM-DD)"
                  name="date"
                  rules={[
                    { required: true, message: "Please enter date (YYYY-MM-DD)" },
                  ]}
                >
                  <Input placeholder="Enter journey date (YYYY-MM-DD)"/>
                </Form.Item>
            <Form.Item
              label="Price"
              name="pricePerSeat"
              rules={[{ required: true, message: "Please enter the price." }]}
            >
              <Input placeholder="Enter price" />
            </Form.Item>
            <Form.Item
              label="Amenities"
              name="amenities"
              rules={[{ required: true, message: "Please enter the amenities." }]}
            >
              <Input placeholder="Enter amenities" />
            </Form.Item>
            <Form.Item
            label="BusType"
            name="busType"
            rules={[{ required: true, message: "Please select the bus type!" }]}
          >
            <Select placeholder="Select Type">
              <Option value="AC_SEATER">AC Seater</Option>
              <Option value="NON_AC_SEATER">Non-AC Seater</Option>
              <Option value="AC_SLEEPER">AC Sleeper</Option>
              <Option value="NON_AC_SLEEPER">Non-AC Sleeper</Option>
            </Select>
          </Form.Item>
          </Form>
          <Form layout="vertical" form={routeForm}>
          <Form.Item
            label="Source"
            name="routeFrom"
            rules={[{ required: true, message: "Please input the source!" }]}
          >
            <AutoComplete
              options={sourceOptions}
              onSearch={handleSourceChange}
              placeholder="Source"
              dropdownStyle={{ width: 200 }} 
            />
          </Form.Item>
          <Form.Item
            label="Destination"
            name="routeTo"
            rules={[
              { required: true, message: "Please input the destination!" },
            ]}
          >
            <AutoComplete
              options={destinationOptions}
              onSearch={handleDestinationChange}
              placeholder="Destination" 
              dropdownStyle={{ width: 200 }} 
            />
          </Form.Item>
          </Form>
        </Modal>
        <Footer />
      </>
    );
  };
  
  export default ManageBuses;
 