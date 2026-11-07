import { useState, useEffect } from 'react'
import { weddingConfig } from '../config/wedding'
import './Countdown.css'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(weddingConfig.date.iso)
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(weddingConfig.date.iso))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  return (
    <section className="countdown">
      <div className="container">
        <p className="countdown__label">{weddingConfig.date.foreverLabel}</p>
        <p className="countdown__forever">
          <span className="countdown__forever-num">{timeLeft.days}</span>
          <span className="countdown__forever-text">days to forever</span>
        </p>
        <div className="countdown__grid">
          {units.map((unit) => (
            <div key={unit.label} className="countdown__unit">
              <span className="countdown__number">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="countdown__text">{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
