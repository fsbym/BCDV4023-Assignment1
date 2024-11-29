import { List, ListItem, ListItemText } from "@mui/material";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import "./Task.css";

const Task = ({ taskText, importance, onClick }) => {
  // Map importance levels to text
  const importanceLevels = {
    0: "Low",
    1: "Medium",
    2: "High",
  };

  return (
    <List className="todo__list">
      <ListItem>
        <ListItemText
          primary={taskText}
          secondary={`Importance: ${importanceLevels[importance]}`}
        />
        {importance === 2 && (
          <PriorityHighIcon color="error" style={{ marginLeft: "10px" }} />
        )}
      </ListItem>
      <DeleteTwoToneIcon
        fontSize="medium"
        color="error"
        style={{ margin: "10px" }}
        onClick={onClick}
      />
    </List>
  );
};

export default Task;
