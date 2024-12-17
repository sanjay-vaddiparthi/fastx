import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import axios from "axios";
import Footer from "./Footer";
import Header from "./Header";
import DataContext from "./context/DataContext";

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null); 
  const [form] = Form.useForm();
  const {userDetails}=useContext(DataContext)

  const BASE_URL = "http://localhost:8084"; 

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/route/getall`);
      console.log("Route Details",response.data)
      setRoutes(response.data.map((route) => ({ ...route, key: route.id })));
    } catch (error) {
      message.error("No routes available");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing) {
        console.log("In handleOK")
        console.log(values)
        await axios.put(`${BASE_URL}/route/admin/update/${editingRoute.routeId}`,values,{
          headers: { Authorization: `Bearer ${userDetails.jwt}`},
        });
        message.success("Route updated successfully!");
      } else {
        console.log(values);
        await axios.post(`${BASE_URL}/route/admin/add`, values,{
          headers: { Authorization: `Bearer ${userDetails.jwt}`},
        });
        message.success("Route added successfully!");
      }

      fetchRoutes(); 
      handleCancel(); 
    } catch (error) {
      message.error("Failed to add or update route. Please try again.");
    }
  };

  const handleEdit = (route) => {
    console.log("In handleEdit",route)
    setEditingRoute(route);
    setIsEditing(true);
    form.setFieldsValue(route);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      Modal.confirm({
        title: "Are you sure you want to delete this route?",
        onOk: async () => {
          console.log(id)
          await axios.delete(`${BASE_URL}/route/admin/delete/${id}`,{
            headers: { Authorization: `Bearer ${userDetails.jwt} `},
          });
          message.success("Route deleted successfully!");
          fetchRoutes(); 
        },
      });
    } catch (error) {
      message.error("Failed to delete route.");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setIsEditing(false);
  };

  const columns = [
    { title: "Source", dataIndex: "routeFrom", key: "source" },
    { title: "Destination", dataIndex: "routeTo", key: "destination" },
    { title: "Boarding Point", dataIndex: "boardingPoint", key: "boardingPoint" },
    { title: "Dropping Point", dataIndex: "dropingPoint", key: "dropingPoint" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.routeId)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <Input.Search
            placeholder="Search routes..."
            style={{ width: "300px" }}
            allowClear
            onSearch={(value) => {
              console.log("In Search",routes)
              const filteredRoutes = routes.filter(
                (route) =>
                  route.routeFrom.toLowerCase().includes(value.toLowerCase()) ||
                  route.routeTo.toLowerCase().includes(value.toLowerCase())
              );
              setRoutes(filteredRoutes);
            }}
          />
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Add Route
          </Button>
        </div>
        <Table dataSource={routes} columns={columns} pagination={false} />

        <Modal
          title={isEditing ? "Edit Route" : "Add Route"}
          visible={isModalVisible}
          onOk={()=>handleOk()}
          onCancel={handleCancel}
          okText={isEditing ? "Update" : "Add"}
          cancelText="Cancel"
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              label="Source"
              name="routeFrom"
              rules={[{ required: true, message: "Please enter the source." }]}
            >
              <Input placeholder="Enter source" />
            </Form.Item>
            <Form.Item
              label="Destination"
              name="routeTo"
              rules={[{ required: true, message: "Please enter the destination." }]}
            >
              <Input placeholder="Enter destination" />
            </Form.Item>
            <Form.Item
              label="Boarding Point"
              name="boardingPoint"
              rules={[{ required: true, message: "Please enter the boarding point." }]}
            >
              <Input placeholder="Enter boarding point" />
            </Form.Item>
            <Form.Item
              label="Dropping Point"
              name="dropingPoint"
              rules={[{ required: true, message: "Please enter the dropping point." }]}
            >
              <Input placeholder="Enter dropping point" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <Footer />
    </>
  );
};

export default RouteManagement;