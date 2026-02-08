'use client'

import { useMemo, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const defaultCenter = { lat: 20.5937, lng: 78.9629 } // India center
const defaultZoom = 5

/**
 * Reusable Google Map for showing and optionally picking locations.
 * Uses free-tier Google Maps JavaScript API (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
 *
 * @param {Object} props
 * @param {{ lat: number, lng: number }} [props.center] - Map center
 * @param {number} [props.zoom] - Zoom level (default 10)
 * @param {Array<{ lat: number, lng: number, label?: string }>} [props.markers] - Markers to show
 * @param {function({ lat: number, lng: number }): void} [props.onMapClick] - Called when user clicks map (for picking location)
 * @param {string} [props.className] - Container class
 * @param {string} [props.height] - e.g. '300px', '100%'
 * @param {string} [props.width] - e.g. '100%'
 */
export default function LocationMap({
  center = defaultCenter,
  zoom = defaultZoom,
  markers = [],
  onMapClick,
  className = '',
  height = '300px',
  width = '100%'
}) {
  const apiKey = typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'string'
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
    : ''

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  })

  const containerStyle = useMemo(() => ({
    width,
    height
  }), [width, height])

  const mapCenter = useMemo(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') return center
    if (markers.length > 0 && markers[0].lat != null && markers[0].lng != null) {
      return { lat: Number(markers[0].lat), lng: Number(markers[0].lng) }
    }
    return defaultCenter
  }, [center, markers])

  const handleClick = useCallback((e) => {
    if (onMapClick && e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      onMapClick({ lat, lng })
    }
  }, [onMapClick])

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <p className="text-sm">Add <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to <code className="bg-gray-200 px-1 rounded">.env.local</code> to show the map.</p>
          <p className="text-xs mt-2">Get a free key at <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a> (Maps JavaScript API).</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 ${className}`}
        style={{ width, height }}
      >
        <p className="text-sm">Failed to load Google Maps.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 ${className}`}
        style={{ width, height }}
      >
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`} style={{ width, height }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        onClick={onMapClick ? handleClick : undefined}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {markers.map((m, i) => {
          const lat = m.lat != null ? Number(m.lat) : null
          const lng = m.lng != null ? Number(m.lng) : null
          if (lat == null || lng == null) return null
          return (
            <Marker
              key={m.id != null ? m.id : `marker-${i}`}
              position={{ lat, lng }}
              title={m.label || m.name || undefined}
            />
          )
        })}
      </GoogleMap>
    </div>
  )
}
