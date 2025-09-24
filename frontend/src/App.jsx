import React, { useState } from 'react'
import Map from './components/Map'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [watershedData, setWatershedData] = useState(null)

  const handleWatershedDataChange = (data) => {
    console.log('App: Received watershed data from Sidebar:', data)
    setWatershedData(data)
  }

  // Debug logging
  React.useEffect(() => {
    console.log('App: watershedData state updated:', watershedData)
  }, [watershedData])

  return (
    <div className="app">
      <div className="map-container">
        <Map watershedData={watershedData} />
      </div>
      <Sidebar onWatershedDataChange={handleWatershedDataChange} />
    </div>
  )
}

export default App
