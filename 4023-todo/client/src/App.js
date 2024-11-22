import React, { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import Task from "./Task";
import "./App.css";
import { TaskContractAddress } from "./config.js";
import TaskAbi from "./TaskContract.json";

const { ethers } = require("ethers");

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [correctNetwork, setCorrectNetwork] = useState(false);

  const getAllTasks = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );
        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      } else {
        console.log("Ethereum object does not exist.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllTasks();
  }, [tasks]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Metamask not detected.");
        return;
      }
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain: " + chainId);
      const sepoliaChainId = "0xaa36a7"; // 11155111
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
    let task = {
      taskText: input,
      isDeleted: false,
    };
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );
        TaskContract.addTask(task.taskText, task.isDeleted)
          .then((response) => {
            // spread operator -- copy the elements of 'tasks' array into a new array with new task appended
            setTasks([...tasks, task]);
            console.log("Task added.");
          })
          .catch((err) => {
            console.log("Error when adding new task.");
          });
      } else {
        console.log("Ethereum object does not exist.");
      }
    } catch (error) {
      console.log("Error submitting new task. ", error);
    }
    setInput("");
  };

  const deleteTask = (key) => async () => {
    console.log("Task ID to delete: " + key);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );
        let deleteTx = await TaskContract.deleteTask(key, true);
        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      } else {
        console.log("Ethereum object does not exist.");
      }
    } catch (error) {
      console.log(error);
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
            style={{ width: "40%", height: "30%" }}
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
            {tasks.map((item) => (
              <Task
                key={item.id}
                taskText={item.taskText}
                onClick={deleteTask(item.id)}
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
