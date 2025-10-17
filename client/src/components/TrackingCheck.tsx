// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { ArrowLeft, Clock, MapPin } from "lucide-react";
// import Header from "./Header";
// import Footer from "./Footer";
// import LoadingSpinner from "./LoadingSpinner";
// import OrderStatusTimeline from "./OrderStatusTimeline";
// import RiderInfo from "./RiderInfo";
// import { Order } from "../types";

// const CustomerTracking: React.FC = () => {
//   const { orderNumber } = useParams<{ orderNumber: string }>();
//   const [order, setOrder] = useState<Order | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Mock data for Week 1 (will connect to API in Week 2)
//     const fetchOrder = () => {
//       setTimeout(() => {
//         // Simulate API call
//         const mockOrder: Order = {
//           orderNumber: orderNumber || "ORD-001",
//           status: "out_for_delivery",
//           estimatedDeliveryTime: "2025-10-03T14:30:00Z",
//           isDelayed: false,
//           rider: {
//             name: "Adebayo Johnson",
//             phone: "+234 801 234 5678",
//             photo: undefined,
//           },
//           items: [
//             { name: "Jollof Rice with Chicken", quantity: 2, price: 2500 },
//             { name: "Plantain", quantity: 1, price: 500 },
//           ],
//           deliveryAddress: {
//             street: "123 Allen Avenue",
//             area: "Ikeja",
//             city: "Lagos",
//             coordinates: [3.3792, 6.5244],
//           },
//         };

//         setOrder(mockOrder);
//         setLoading(false);
//       }, 1000);
//     };

//     fetchOrder();
//   }, [orderNumber]);

//   const formatETA = (isoTime: string): string => {
//     const date = new Date(isoTime);
//     return date.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const calculateMinutesRemaining = (isoTime: string): number => {
//     const eta = new Date(isoTime);
//     const now = new Date();
//     const diff = eta.getTime() - now.getTime();
//     return Math.max(0, Math.floor(diff / 60000));
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Header />
//         <div className="flex-grow flex items-center justify-center">
//           <LoadingSpinner size="lg" />
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (error || !order) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <Header />
//         <div className="flex-grow flex items-center justify-center px-4">
//           <div className="text-center">
//             <p className="text-6xl mb-4">😔</p>
//             <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
//             <p className="text-gray-600 mb-6">
//               We couldn't find an order with number: {orderNumber}
//             </p>
//             <Link
//               to="/"
//               className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
//             >
//               Try Another Order
//             </Link>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   const minutesRemaining = calculateMinutesRemaining(
//     order.estimatedDeliveryTime
//   );

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Header />

//       <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
//         {/* Back Button */}
//         <Link
//           to="/"
//           className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Track Another Order
//         </Link>

//         <div className="max-w-3xl mx-auto">
//           {/* Order Header */}
//           <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
//             <div className="flex justify-between items-start mb-4">
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//                   {order.orderNumber}
//                 </h1>
//                 <p className="text-gray-600 mt-1">
//                   {order.items?.length} item(s)
//                 </p>
//               </div>

//               {order.isDelayed && (
//                 <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
//                   Delayed
//                 </span>
//               )}
//             </div>

//             {/* ETA Card */}
//             <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl mb-6">
//               <div className="flex items-center gap-2 mb-2">
//                 <Clock className="w-5 h-5" />
//                 <p className="text-sm font-medium opacity-90">
//                   Estimated Delivery
//                 </p>
//               </div>
//               <p className="text-4xl font-bold mb-1">
//                 {formatETA(order.estimatedDeliveryTime)}
//               </p>
//               <p className="text-sm opacity-90">
//                 {minutesRemaining} minutes remaining
//               </p>
//             </div>

//             {/* Delivery Address */}
//             <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
//               <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
//               <div>
//                 <p className="text-sm font-semibold text-gray-700">
//                   Delivering to
//                 </p>
//                 <p className="text-gray-900">
//                   {order.deliveryAddress?.street}, {order.deliveryAddress?.area}
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   {order.deliveryAddress?.city}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Order Status */}
//           <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
//             <h2 className="text-xl font-bold mb-6">Order Status</h2>
//             <OrderStatusTimeline status={order.status} />
//           </div>

//           {/* Rider Info */}
//           {order.rider && order.status === "out_for_delivery" && (
//             <RiderInfo rider={order.rider} className="mb-6" />
//           )}

//           {/* Order Items */}
//           <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
//             <h2 className="text-xl font-bold mb-4">Order Items</h2>
//             <div className="space-y-3">
//               {order.items?.map((item, index) => (
//                 <div
//                   key={index}
//                   className="flex justify-between items-center py-2 border-b last:border-0"
//                 >
//                   <div>
//                     <p className="font-medium">{item.name}</p>
//                     <p className="text-sm text-gray-600">
//                       Qty: {item.quantity}
//                     </p>
//                   </div>
//                   <p className="font-semibold">
//                     ₦{item.price.toLocaleString()}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// };

// export default CustomerTracking;
