interface TimerProps {
  seconds: number;
}

export default function Timer({ seconds }: TimerProps) {
  // Calculate color based on remaining time
  const getColor = () => {
    if (seconds > 5) return 'text-green-600';
    if (seconds > 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`text-2xl font-bold ${getColor()}`}>
      {seconds}s
    </div>
  );
} 