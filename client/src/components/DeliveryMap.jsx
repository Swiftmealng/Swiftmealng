// import React, { useMemo, useState, useCallback, useEffect } from 'react';
// import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
// import { MapPin, Navigation, Home } from 'lucide-react';
// import { LocationUpdate } from '../../services/socket';


// const DeliveryMap = ({
//   riderLocation,
//   deliveryLocation,
//   restaurantLocation,
//   locationHistory = [],
//   riderName = 'Your Rider',
//   estimatedTime,
//   className = '',
// }) => {
//   const [map, setMap] = useState(null);
//   const [showRiderInfo, setShowRiderInfo] = useState(false);
//   const [mapLoaded, setMapLoaded] = useState(false);

//   const containerStyle = {
//     width: '100%',
//     height: '450px',
//     borderRadius: '16px',
//   };

//   // Calculate center and zoom to fit all markers
//   const center = useMemo(() => {
//     if (!riderLocation) return deliveryLocation;
//     return {
//       lat: (riderLocation.lat + deliveryLocation.lat) / 2,
//       lng: (riderLocation.lng + deliveryLocation.lng) / 2,
//     };
//   }, [riderLocation, deliveryLocation]);

//   const options = {
//     disableDefaultUI: false,
//     clickableIcons: false,
//     scrollwheel: true,
//     zoomControl: true,
//     mapTypeControl: false,
//     streetViewControl: false,
//     fullscreenControl: true,
//     styles: [
//       {
//         featureType: 'poi',
//         elementType: 'labels',
//         stylers: [{ visibility: 'off' }],
//       },
//     ],
//   };

//   // Fit bounds to show all markers
//   const onLoad = useCallback(
//     (map) => {
//       const bounds = new window.google.maps.LatLngBounds();

//       if (riderLocation) {
//         bounds.extend(riderLocation);
//       }
//       if (restaurantLocation) {
//         bounds.extend(restaurantLocation);
//       }
//       bounds.extend(deliveryLocation);

//       map.fitBounds(bounds);
      
//       // Add padding
//       const padding = { top: 50, right: 50, bottom: 50, left: 50 };
//       map.fitBounds(bounds, padding);
      
//       setMap(map);
//       setMapLoaded(true);
//     },
//     [riderLocation, restaurantLocation, deliveryLocation]
//   );

//   // Update bounds when rider location changes
//   useEffect(() => {
//     if (map && mapLoaded && riderLocation) {
//       const bounds = new window.google.maps.LatLngBounds();
//       bounds.extend(riderLocation);
//       bounds.extend(deliveryLocation);
      
//       map.panToBounds(bounds);
//     }
//   }, [riderLocation, deliveryLocation, map, mapLoaded]);

//   const onUnmount = useCallback(() => {
//     setMap(null);
//   }, []);

//   // Create path from location history
//   const pathCoordinates = useMemo(() => {
//     if (locationHistory.length > 1) {
//       return locationHistory.map((loc) => ({ lat: loc.lat, lng: loc.lng }));
//     }
//     if (riderLocation) {
//       return [riderLocation, deliveryLocation];
//     }
//     return [];
//   }, [locationHistory, riderLocation, deliveryLocation]);

//   // Custom marker icons
//   const riderIcon = useMemo(() => ({
//     url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
//       <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
//         <circle cx="12" cy="12" r="11" fill="#f97316" stroke="#fff" stroke-width="2"/>
//         <path d="M8 12h8M12 8v8" stroke="#fff" stroke-width="2"/>
//       </svg>
//     `),
//     scaledSize: new window.google.maps.Size(48, 48),
//     anchor: new window.google.maps.Point(24, 24),
//   }), []);

//   const deliveryIcon = useMemo(() => ({
//     url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
//       <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
//         <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10b981"/>
//         <circle cx="12" cy="9" r="2.5" fill="#fff"/>
//       </svg>
//     `),
//     scaledSize: new window.google.maps.Size(48, 48),
//     anchor: new window.google.maps.Point(24, 48),
//   }), []);

//   const restaurantIcon = useMemo(() => ({
//     url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
//       <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
//         <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#6366f1"/>
//         <circle cx="12" cy="9" r="2.5" fill="#fff"/>
//       </svg>
//     `),
//     scaledSize: new window.google.maps.Size(48, 48),
//     anchor: new window.google.maps.Point(24, 48),
//   }), []);

//   // Calculate distance (simple Haversine formula)
//   const calculateDistance = (loc1, loc2) => {
//     const R = 6371; // Earth's radius in km
//     const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
//     const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((loc1.lat * Math.PI) / 180) *
//         Math.cos((loc2.lat * Math.PI) / 180) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   const distanceToDelivery = useMemo(() => {
//     if (!riderLocation) return null;
//     const distance = calculateDistance(riderLocation, deliveryLocation);
//     return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
//   }, [riderLocation, deliveryLocation]);

//   if (!process.env.REACT_APP_GOOGLE_MAPS_KEY) {
//     return (
//       <div className={`bg-gray-100 rounded-2xl p-8 text-center ${className}`}>
//         <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
//         <p className="text-gray-700 font-semibold mb-2">Map not available</p>
//         <p className="text-sm text-gray-500">Google Maps API key not configured</p>
//       </div>
//     );
//   }

//   return (
//     <div className={className}>
//       {/* Map Header */}
//       <div className="mb-4">
//         <div className="flex justify-between items-center mb-3">
//           <h3 className="text-xl font-bold text-gray-900">Live Tracking</h3>
//           {estimatedTime && (
//             <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
//               ETA: {estimatedTime}
//             </div>
//           )}
//         </div>

//         {/* Legend */}
//         <div className="flex flex-wrap gap-4 text-sm">
//           {riderLocation && (
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow"></div>
//               <span className="text-gray-700 font-medium">Rider {distanceToDelivery && `(${distanceToDelivery} away)`}</span>
//             </div>
//           )}
//           {restaurantLocation && (
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow"></div>
//               <span className="text-gray-700">Restaurant</span>
//             </div>
//           )}
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
//             <span className="text-gray-700">Your Location</span>
//           </div>
//         </div>
//       </div>

//       {/* Map Container */}
//       <div className="relative overflow-hidden rounded-2xl shadow-lg">
//         <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
//           <GoogleMap
//             mapContainerStyle={containerStyle}
//             center={center}
//             zoom={14}
//             onLoad={onLoad}
//             onUnmount={onUnmount}
//             options={options}
//           >
//             {/* Rider Marker with Animation */}
//             {riderLocation && (
//               <>
//                 <Marker
//                   position={riderLocation}
//                   icon={riderIcon}
//                   title={riderName}
//                   animation={google.maps.Animation.BOUNCE}
//                   onClick={() => setShowRiderInfo(true)}
//                 />

//                 {/* Rider Info Window */}
//                 {showRiderInfo && (
//                   <InfoWindow
//                     position={riderLocation}
//                     onCloseClick={() => setShowRiderInfo(false)}
//                   >
//                     <div className="p-2">
//                       <p className="font-semibold text-gray-900">{riderName}</p>
//                       <p className="text-sm text-gray-600">On the way to you</p>
//                       {distanceToDelivery && (
//                         <p className="text-xs text-orange-600 mt-1">
//                           {distanceToDelivery} away
//                         </p>
//                       )}
//                     </div>
//                   </InfoWindow>
//                 )}
//               </>
//             )}

//             {/* Restaurant Marker */}
//             {restaurantLocation && (
//               <Marker
//                 position={restaurantLocation}
//                 icon={restaurantIcon}
//                 title="Restaurant"
//               />
//             )}

//             {/* Delivery Location Marker */}
//             <Marker
//               position={deliveryLocation}
//               icon={deliveryIcon}
//               title="Delivery Location"
//             />

//             {/* Route Polyline with gradient effect */}
//             {pathCoordinates.length > 0 && (
//               <>
//                 {/* Shadow/outline */}
//                 <Polyline
//                   path={pathCoordinates}
//                   options={{
//                     strokeColor: '#000000',
//                     strokeOpacity: 0.2,
//                     strokeWeight: 8,
//                   }}
//                 />
//                 {/* Main route */}
//                 <Polyline
//                   path={pathCoordinates}
//                   options={{
//                     strokeColor: '#f97316',
//                     strokeOpacity: 0.9,
//                     strokeWeight: 5,
//                     geodesic: true,
//                   }}
//                 />
//               </>
//             )}
//           </GoogleMap>
//         </LoadScript>

//         {/* Floating action buttons */}
//         {map && (
//           <div className="absolute bottom-4 right-4 flex flex-col gap-2">
//             {/* Center on rider */}
//             {riderLocation && (
//               <button
//                 onClick={() => {
//                   map.panTo(riderLocation);
//                   map.setZoom(16);
//                 }}
//                 className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
//                 title="Center on rider"
//               >
//                 <Navigation className="w-5 h-5 text-orange-500" />
//               </button>
//             )}

//             {/* Center on delivery */}
//             <button
//               onClick={() => {
//                 map.panTo(deliveryLocation);
//                 map.setZoom(16);
//               }}
//               className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
//               title="Center on delivery location"
//             >
//               <Home className="w-5 h-5 text-green-500" />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Distance info */}
//       {riderLocation && distanceToDelivery && (
//         <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Navigation className="w-5 h-5 text-orange-600" />
//               <span className="text-sm font-medium text-gray-700">Distance to you</span>
//             </div>
//             <span className="text🚥🚥🚥🚥🚥-lg font-bold text-orange-600">{distanceToDelivery} </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default React.memo(DeliveryMap);