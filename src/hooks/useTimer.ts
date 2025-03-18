import { useState, useEffect, useCallback, useRef } from 'react';

export default function useTimer(initialTime: number = 10, onTimeUp?: () => void) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);
  const timerCalledRef = useRef(false);

  // Update the ref when onTimeUp changes
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Reset timer to initial time
  const resetTimer = useCallback(() => {
    setTime(initialTime);
    setIsRunning(false);
    timerCalledRef.current = false;
  }, [initialTime]);

  // Start the timer
  const startTimer = useCallback(() => {
    setIsRunning(true);
    timerCalledRef.current = false;
  }, []);

  // Stop the timer
  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && time > 0) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isRunning && time === 0 && onTimeUpRef.current && !timerCalledRef.current) {
      timerCalledRef.current = true;
      onTimeUpRef.current();
      setIsRunning(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, time]);

  return {
    time,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
} 