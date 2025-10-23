// File: /components/CompleteButton.js

import React, { useState } from 'react';
import styles from './CompleteButton.module.css'; // Use CSS modules

const CompleteButton = () => {
  // 1. Use useState to create a state variable.
  //    'isCompleted' will store if the task is done (true) or not (false).
  //    Initially, it is not done, so the value is 'false'.
  const [isCompleted, setIsCompleted] = useState(false);

  // 2. This function runs every time the user clicks the button.
  const handleClick = () => {
    // Toggle the state to its opposite value.
    // If it was 'false', it becomes 'true'. If 'true', it becomes 'false'.
    // This allows both marking AND unmarking the task.
    setIsCompleted(prevIsCompleted => !prevIsCompleted);
  };

  return (
    <button
      // 3. The button's className changes based on the state.
      //    If 'isCompleted' is true, it uses the 'button-completed' class.
      //    If false, it uses the 'button-incomplete' class.
      className={isCompleted ? styles['button-completed'] : styles['button-incomplete']}
      onClick={handleClick}
    >
      {/* 4. The button's text also changes based on the state. */}
      {isCompleted ? 'Done' : 'Mark as Done'}
    </button>
  );
};

export default CompleteButton;
