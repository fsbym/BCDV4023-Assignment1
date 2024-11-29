// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TaskContract is Ownable {
    enum Importance { LOW, MEDIUM, HIGH }

    struct Task {
        uint256 id;
        address username;
        string taskText;
        Importance importance;
        bool isDeleted;
    }

    Task[] private tasks;

    // Mapping of Task id to the wallet address of the user
    mapping(uint256 => address) taskToOwner;

    event AddTask(address recipient, uint256 taskId);
    event DeleteTask(uint256 taskId, bool isDeleted);

    constructor() Ownable(msg.sender) {}

    function addTask(string memory taskText, Importance imp, bool isDeleted) external {
        uint256 taskId = tasks.length;
        tasks.push(Task(taskId, msg.sender, taskText, imp, isDeleted));
        taskToOwner[taskId] = msg.sender;
        emit AddTask(msg.sender, taskId);
    }

    function getMyTasks() external view returns (Task[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < tasks.length; i++) {
            if (taskToOwner[i] == msg.sender && !tasks[i].isDeleted) {
                count++;
            }
        }

        Task[] memory result = new Task[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < tasks.length; i++) {
            if (taskToOwner[i] == msg.sender && !tasks[i].isDeleted) {
                result[index] = tasks[i];
                index++;
            }
        }

        return result;
    }

    function deleteTask(uint256 taskId) external {
        if (taskToOwner[taskId] == msg.sender) {
            tasks[taskId].isDeleted = true;
            emit DeleteTask(taskId, true);
        }
    }
}