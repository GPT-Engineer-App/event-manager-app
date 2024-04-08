import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Input, Text, Heading, VStack, HStack, IconButton, useToast } from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:1337/api";

const Index = () => {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();
      setEvents(data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const createEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            Name: name,
            Description: description,
          },
        }),
      });
      const data = await response.json();
      setEvents([...events, data.data]);
      setName("");
      setDescription("");
      toast({
        title: "Event created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const updateEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/events/${editingEventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            Name: name,
            Description: description,
          },
        }),
      });
      const data = await response.json();
      const updatedEvents = events.map((event) => (event.id === editingEventId ? data.data : event));
      setEvents(updatedEvents);
      setEditingEventId(null);
      setName("");
      setDescription("");
      toast({
        title: "Event updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
      });
      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);
      toast({
        title: "Event deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: username,
          password,
        }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        setUsername("");
        setPassword("");
        toast({
          title: "Logged in successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Invalid credentials",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box maxWidth="600px" margin="auto" padding="4">
      <Heading as="h1" size="xl" textAlign="center" marginBottom="8">
        Event Management
      </Heading>

      {!isLoggedIn ? (
        <VStack spacing="4">
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button onClick={handleLogin}>Login</Button>
        </VStack>
      ) : (
        <>
          <HStack justifyContent="space-between" marginBottom="4">
            <Text>Welcome, {username}!</Text>
            <Button onClick={handleLogout}>Logout</Button>
          </HStack>

          <VStack spacing="4" alignItems="stretch">
            <FormControl>
              <FormLabel>Event Name</FormLabel>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Event Description</FormLabel>
              <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>
            <Button leftIcon={<FaPlus />} onClick={editingEventId ? updateEvent : createEvent}>
              {editingEventId ? "Update Event" : "Create Event"}
            </Button>
          </VStack>

          <VStack spacing="4" marginTop="8" alignItems="stretch">
            {events.map((event) => (
              <Box key={event.id} borderWidth="1px" borderRadius="md" padding="4">
                <Heading as="h3" size="md">
                  {event.attributes.Name}
                </Heading>
                <Text>{event.attributes.Description}</Text>
                <HStack justifyContent="flex-end" marginTop="4">
                  <IconButton
                    icon={<FaEdit />}
                    onClick={() => {
                      setEditingEventId(event.id);
                      setName(event.attributes.Name);
                      setDescription(event.attributes.Description);
                    }}
                    aria-label="Edit Event"
                  />
                  <IconButton icon={<FaTrash />} onClick={() => deleteEvent(event.id)} aria-label="Delete Event" />
                </HStack>
              </Box>
            ))}
          </VStack>
        </>
      )}
    </Box>
  );
};

export default Index;
