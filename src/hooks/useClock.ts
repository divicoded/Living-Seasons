import { useEffect, useState } from 'react';

export interface ClockData {
  time: Date;
  hours: number;
  minutes: number;
  seconds: number;
  hours12: number;
  ampm: 'AM' | 'PM';
  day: string;
  date: string;
  month: string;
  year: number;
  greeting: string;
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
}

function greetingFor(h: number): string {
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function useClock(): ClockData {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  return {
    time,
    hours,
    minutes,
    seconds,
    hours12,
    ampm,
    day: time.toLocaleDateString(undefined, { weekday: 'long' }),
    date: time.toLocaleDateString(undefined, { day: 'numeric' }),
    month: time.toLocaleDateString(undefined, { month: 'long' }),
    year: time.getFullYear(),
    greeting: greetingFor(hours),
    hourAngle: (hours12 / 12) * 360 + (minutes / 60) * 30,
    minuteAngle: (minutes / 60) * 360,
    secondAngle: (seconds / 60) * 360,
  };
}

export default useClock;
