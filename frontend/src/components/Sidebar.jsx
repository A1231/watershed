import React, { useState, useEffect, useRef } from 'react'
import { Droplets, Search, MapPin, Users, Square, TrendingUp } from 'lucide-react'
import { watershedAPI } from '../services/api'

const Sidebar = ({ onWatershedDataChange }) => {
  const [searchType, setSearchType] = useState('huc')
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const debounceTimeoutRef = useRef(null)

  const formatNumber = (num) => {
    if (!num) return 'N/A'
    return new Intl.NumberFormat().format(num)
  }

  const formatArea = (area) => {
    if (!area) return 'N/A'
    return `${formatNumber(area)} sq km`
  }

  const formatPopulation = (pop) => {
    if (!pop) return 'N/A'
    return formatNumber(pop)
  }

  const formatAcres = (acres) => {
    if (!acres) return 'N/A'
    return `${formatNumber(acres)} acres`
  }

  // Autocomplete functions
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)
    try {
      let response
      if (searchType === 'basin') {
        response = await watershedAPI.autocompleteBasinNames(query)
      } else if (searchType === 'hu12name') {
        response = await watershedAPI.autocompleteHu12Names(query)
      } else {
        return // No autocomplete for HUC codes
      }

      if (response.data) {
        setSuggestions(response.data)
        setShowSuggestions(response.data.length > 0)
        setSelectedSuggestionIndex(-1) // Reset selection when new suggestions arrive
      }
    } catch (error) {
      console.log('Autocomplete error:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Debounced search for autocomplete
  const debouncedFetchSuggestions = (query) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300) // 300ms delay
  }

  // Handle input change with autocomplete
  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    
    // Trigger autocomplete for basin and hu12name
    if (searchType === 'basin' || searchType === 'hu12name') {
      debouncedFetchSuggestions(value)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion)
    setShowSuggestions(false)
    setSuggestions([])
    setSelectedSuggestionIndex(-1)
    
    // Focus back to input after selection
    setTimeout(() => {
      const input = document.querySelector('.search-input')
      if (input) {
        input.focus()
      }
    }, 100)
  }

  // Handle search type change
  const handleSearchTypeChange = (e) => {
    const newType = e.target.value
    setSearchType(newType)
    setSearchValue('')
    setSuggestions([])
    setShowSuggestions(false)
    
    // Clear any pending debounced calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
  }

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchValue.trim()) return

    setIsLoading(true)
    setError(null)
    setSearchResults(null)

    try {
      let results
      if (searchType === 'huc') {
        results = await watershedAPI.getWatershedByHUC(searchValue.trim())
      } else if (searchType === 'basin') {
        results = await watershedAPI.getWatershedsInBasin(searchValue.trim())
      } else if (searchType === 'hu12name') {
        results = await watershedAPI.getWatershedsByHu12Name(searchValue.trim())
      }
      
      setSearchResults(results)
      console.log('Sidebar: Results:', results)
      // Pass watershed data to map for rendering
      if (onWatershedDataChange) {
        console.log('Sidebar: Processing results for map:', results)
        if (searchType === 'huc' && results.data) {
          // Single watershed - pass as single feature
          console.log('Sidebar: Passing single watershed data:', results.data)
          console.log('Sidebar: Data type:', results.data.type)
          console.log('Sidebar: Has geometry?', !!results.data.geometry)
          onWatershedDataChange(results.data)
        } else if ((searchType === 'basin' || searchType === 'hu12name') && results.data) {
          // Multiple watersheds - check if it's already a FeatureCollection or needs wrapping
          if (results.data.type === 'FeatureCollection') {
            // Already a FeatureCollection, pass it directly
            console.log(`Sidebar: Passing ${searchType} data (already FeatureCollection):`, results.data)
            console.log('Sidebar: Feature count:', results.data.features?.length)
            onWatershedDataChange(results.data)
          } else if (Array.isArray(results.data)) {
            // Array of features, wrap in FeatureCollection
            const featureCollection = {
              type: 'FeatureCollection',
              features: results.data
            }
            console.log(`Sidebar: Passing ${searchType} data as FeatureCollection:`, featureCollection)
            console.log('Sidebar: Feature count:', results.data.length)
            onWatershedDataChange(featureCollection)
          }
        } else {
          console.log('Sidebar: No valid data to pass to map')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchValue('')
    setSearchResults(null)
    setError(null)
    
    // Clear watershed data from map
    if (onWatershedDataChange) {
      onWatershedDataChange(null)
    }
  }

  return (
    <div className="sidebar">
      <div>
        <h1>Watershed Analysis</h1>
        <p>Interactive map of North Carolina watersheds.</p>
        
        {/* Search Form */}
        <div className="search-section">
          <h4>Search Watersheds</h4>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-controls">
              <select 
                value={searchType} 
                onChange={handleSearchTypeChange}
                className="search-dropdown"
              >
                <option value="huc">Search by HUC Code</option>
                <option value="basin">Search by Basin</option>
                <option value="hu12name">Search by HUC 12 Name</option>
              </select>
              
              <div className="autocomplete-container">
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  onBlur={(e) => {
                    // Only hide suggestions if focus is not moving to a suggestion
                    const relatedTarget = e.relatedTarget
                    if (!relatedTarget || !relatedTarget.classList.contains('autocomplete-item')) {
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                  }}
                  placeholder={
                    searchType === 'huc' ? 'Enter HUC code (8, 10, or 12 digits)' :
                    searchType === 'basin' ? 'Enter basin name' :
                    'Enter HUC 12 name'
                  }
                  className="search-input"
                />
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`autocomplete-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Loading indicator for suggestions */}
                {isLoadingSuggestions && (
                  <div className="autocomplete-loading">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || !searchValue.trim()}
                className="search-button"
              >
                <Search size={16} />
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="instructions">
          <h4>How to use:</h4>
          <p>• Search by HUC code, basin name, or HUC 12 name above</p>
          <p>• Click on the map to see coordinates</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            Searching watersheds...
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults && (
          <div className="search-results">
            {searchType === 'huc' && searchResults.data && (
              <div className="watershed-info">
                <div className="result-header">
                  <h3>
                    <MapPin size={20} style={{ marginRight: '8px', display: 'inline' }} />
                    {searchResults.data.properties?.hu_12_name || 'Watershed Found'}
                  </h3>
                  <button onClick={clearSearch} className="clear-button">×</button>
                </div>
                
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">HUC-12 Code</div>
                    <div className="info-value">{searchResults.data.properties?.huc_12 || 'N/A'}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">HUC-10 Code</div>
                    <div className="info-value">{searchResults.data.properties?.huc_10 || 'N/A'}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">HUC-8 Code</div>
                    <div className="info-value">{searchResults.data.properties?.huc_8 || 'N/A'}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">Basin</div>
                    <div className="info-value">{searchResults.data.properties?.basin || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ 
                    color: '#f1f5f9', 
                    marginBottom: '12px', 
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Square size={16} style={{ marginRight: '8px' }} />
                    Area & Population
                  </h4>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Total Area</div>
                      <div className="info-value">{formatArea(searchResults.data.properties?.area)}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Acres</div>
                      <div className="info-value">{formatAcres(searchResults.data.properties?.acres)}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Current Population</div>
                      <div className="info-value">{formatPopulation(searchResults.data.properties?.population)}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">2010 Population</div>
                      <div className="info-value">{formatPopulation(searchResults.data.properties?.pop_2010)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(searchType === 'basin' || searchType === 'hu12name') && searchResults.data && (
              <div className="basin-results">
                <div className="result-header">
                  <h3>{searchType === 'basin' ? 'Basin Results' : 'HUC 12 Name Results'}</h3>
                  <button onClick={clearSearch} className="clear-button">×</button>
                </div>
                <p className="result-count">
                  {searchType === 'basin' 
                    ? `Found ${searchResults.count} watersheds in ${searchValue}` 
                    : `Found ${searchResults.count} watersheds matching "${searchValue}"`
                  }
                </p>
                
                <div className="watershed-list">
                  {(searchResults.data.features || searchResults.data).slice(0, 5).map((watershed, index) => (
                    <div key={index} className="watershed-item">
                      <h4>{watershed.properties?.hu_12_name || 'Unnamed Watershed'}</h4>
                      <p><strong>HUC-12:</strong> {watershed.properties?.huc_12 || 'N/A'}</p>
                      <p><strong>Area:</strong> {formatArea(watershed.properties?.area)}</p>
                      <p><strong>Population:</strong> {formatPopulation(watershed.properties?.population)}</p>
                    </div>
                  ))}
                  {(searchResults.data.features || searchResults.data).length > 5 && (
                    <p className="more-results">... and {(searchResults.data.features || searchResults.data).length - 5} more watersheds</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !searchResults && !error && (
          <div className="empty-state">
            <Droplets size={64} />
            <h3>Interactive Map Ready</h3>
            <p>Search for watersheds by HUC code, basin name, or HUC 12 name to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar