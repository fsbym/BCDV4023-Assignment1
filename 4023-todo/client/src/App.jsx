import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import Task from "./Task.jsx";
import "./App.css";
import { TaskContractAddress } from "./config.js";
import TaskAbi from "./TaskContract.json";

const { ethers } = require("ethers");

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [importance, setImportance] = useState("LOW");
  const [currentAccount, setCurrentAccount] = useState("");
  const [correctNetwork, setCorrectNetwork] = useState(false);

  const importanceMapping = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
  };

  const getAllTasks = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );

        const tasks = await TaskContract.getMyTasks();
        console.log("Tasks retrieved from contract:", tasks);

        // Format tasks
        const items = tasks.map((task) => ({
          id: Number(task.id), // Convert BigInt to Number
          taskText: task.taskText,
          importance: Number(task.importance), // Convert BigInt to Number
          isDeleted: task.isDeleted,
        }));
        console.log("Formatted tasks:", items);
        setTasks(items);
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    getAllTasks();
  }, []);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Metamask not detected.");
        return;
      }
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain: " + chainId);
      const sepoliaChainId = "0xaa36a7"; // Sepolia chain ID in hex
      if (chainId !== sepoliaChainId) {
        alert("You are not connected to the Sepolia Testnet.");
        return;
      } else {
        setCorrectNetwork(true);
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      console.log("MetaMask Account: " + accounts[0]);
    } catch (error) {
      console.log("Error connecting to MetaMask.", error);
    }
  };

  const addTask = async (event) => {
    event.preventDefault();
    if (!input) return;

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );

        const importanceLevel = importanceMapping[importance];

        console.log(
          "Adding task with parameters:",
          input,
          importanceLevel,
          false
        );

        const tx = await TaskContract.addTask(input, importanceLevel, false);
        console.log("Transaction response:", tx);
        await tx.wait();
        console.log("Transaction mined");

        // Clear the input fields
        setInput("");
        setImportance("LOW");

        // Refresh tasks
        getAllTasks();
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (key) => {
    console.log("Task ID to delete: " + key);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );
        let deleteTx = await TaskContract.deleteTask(key);
        await deleteTx.wait();
        console.log("Task deleted.");

        // Refresh tasks
        getAllTasks();
      } else {
        console.log("Ethereum object does not exist.");
      }
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };

  return (
    <div>
      {currentAccount === "" ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="info"
            style={{
              justifyContent: "center",
              margin: "50px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
            onClick={connectWallet}
          >
            Connect 🦊 MetaMask Wallet ➡ Sepolia Testnet
          </Button>
        </div>
      ) : correctNetwork ? (
        <div className="App">
          <img
            src={require("./todo.jpg")}
            style={{ width: "10%", height: "10%" }}
            alt="To-Do List"
          />
          <form style={{ margin: "20px 30px 20px" }}>
            <TextField
              id="outlined-basic"
              helperText="Enter a task then click the '+'"
              label="Task"
              style={{ margin: "0px 10px 30px" }}
              size="normal"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <FormControl style={{ margin: "0px 10px 30px" }}>
              <Select
                labelId="importance-label"
                id="importance"
                value={importance}
                onChange={(event) => setImportance(event.target.value)}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="text"
              color="info"
              style={{ fontSize: "28px", fontWeight: "bold" }}
              onClick={addTask}
            >
              +
            </Button>
          </form>
          <ul>
            {tasks.map((task) => (
              <Task
                key={task.id}
                taskText={task.taskText}
                importance={task.importance}
                onClick={() => deleteTask(task.id)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3">
          <div>
            Connect to the Ethereum Sepolia Testnet and reload the page.
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
