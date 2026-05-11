'use client'
import { useSession } from 'next-auth/react'

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <div style={{
      height: '80vh', // Takes up most of the screen
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center', // Centers vertically
      alignItems: 'center',     // Centers horizontally
      borderRadius: '20px',
      position: 'relative',
      overflow: 'hidden',
      color: 'white',
      textAlign: 'center',
      // Cool Airplane Background
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?q=80&w=2070&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      
      {/* The Text Content */}
      <div style={{ zIndex: 1 }}>
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: 'bold', 
          margin: 0,
          textShadow: '2px 2px 10px rgba(0,0,0,0.5)' 
        }}>
          Welcome back,
        </h1>
        <p style={{ 
          fontSize: '3rem', 
          marginTop: '10px',
          color: '#378ADD', // Matching your Navbar blue
          background: 'rgba(255,255,255,0.9)',
          padding: '5px 25px',
          borderRadius: '50px',
          display: 'inline-block',
          fontWeight: '600'
        }}>
          {session?.user?.name || 'Traveler'} ✈️
        </p>
        <p style={{ fontSize: '1.2rem', marginTop: '20px', opacity: 0.9 }}>
          Where are we flying today?
        </p>
      </div>
    </div>
  )
}