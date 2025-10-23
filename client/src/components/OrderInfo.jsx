import React, { useContext } from 'react';
import { OrderContext } from '../hooks/OrderContext';

// const apiData = [
//   {
//     id: 1,
//     name: 'Cold Brew Bottle',
//     description:
//       'This glass bottle comes with a mesh insert for steeping tea or cold-brewing coffee. Pour from any angle and remove the top for easy cleaning.',
//     href: '#',
//     quantity: 1,
//     price: 'N132.00',
//     imageSrc: assets.logo,
//     imageAlt: 'Glass bottle with black plastic pour top and mesh insert.',
//   },
//   {
//     id: 1,
//     name: 'Hot Spices Chicken Peppersoup',
//     description:
//       'This chicken peppersoup comes with enough chicken and it is very spicy, for steeping tea or cold-brewing coffee.',
//     href: '#',
//     quantity: 2,
//     price: 'N13,500.00',
//     imageSrc: assets.banner,
//     imageAlt: 'Glass bottle with black plastic pour top and mesh insert.',
//   },
// ]

export const OrderInfo = () => {
  const {order, orderNumber, formatETA} = useContext(OrderContext)

  // Safety check for order data
  if (!order) {
    return (
      <main className="bg-white px-40 pt-6 pb-4 sm:px-6 sm:pt-4 lg:px-8 lg:py-0">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-500">Loading order information...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white px-40 pt-6 pb-4 sm:px-6 sm:pt-4 lg:px-8 lg:py-0">
      <div className="max-w-3xl mx-auto">
        <div className="max-w-xl">
          <h1 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Thank you!</h1>
          <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">It's on the way!</p>
          <p className="mt-2 text-base text-gray-500">Your order {orderNumber} has shipped and will be with you soon.</p>

          <dl className="mt-7 text-lg font-medium">
            <dt className="text-gray-900">Your Order Details</dt>
          </dl>
        </div>

        <section aria-labelledby="order-heading" className="mt-5 border-t border-gray-200">
          <h2 id="order-heading" className="sr-only">
            Your order
          </h2>

          {/* Order Items */}
          <h3 className="sr-only">Items</h3>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div key={index} className="py-4 border-b border-gray-200 flex space-x-4">
                {item.imageSrc && (
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt || item.name}
                    className="flex-none w-15 h-15 object-center object-cover bg-gray-100 rounded-lg sm:w-25 sm:h-25"
                  />
                )}
                <div className="flex-auto flex flex-col">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {item.name}
                    </h5>
                    {item.description && (
                      <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                  <div className="mt-6 flex-1 flex items-end">
                    <dl className="flex text-sm divide-x divide-gray-200 space-x-2 sm:space-x-6">
                      <div className="flex">
                        <dt className="font-medium text-gray-900">Quantity</dt>
                        <dd className="ml-2 text-gray-700">{item.quantity}</dd>
                      </div>
                      <div className="pl-4 flex sm:pl-6">
                        <dt className="font-medium text-gray-900">Price</dt>
                        <dd className="ml-2 text-gray-700">₦{item.price.toLocaleString()}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-sm text-gray-500">
              No items information available
            </div>
          )}

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="sm:ml-40 sm:pl-6 pt-8">
              <h3 className="sr-only">Your information</h3>

              <h4 className="sr-only">Addresses</h4>
              <dl className="grid grid-cols-2 gap-x-4 text-sm py-5">
                <div>
                  <dt className="font-medium text-gray-900">Shipping address</dt>
                  <dd className="mt-2 text-gray-700">
                    <address className="not-italic">
                      {order.deliveryAddress.street && (
                        <span className="block">{order.deliveryAddress.street},</span>
                      )}
                      {order.deliveryAddress.area && (
                        <span className="block">{order.deliveryAddress.area},</span>
                      )}
                      {order.deliveryAddress.city && (
                        <span className="block">{order.deliveryAddress.city}</span>
                      )}
                    </address>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Shipping method</dt>
                  <dd className="mt-2 text-gray-700">
                    <p>Delivery Bike</p>
                    {order.estimatedDeliveryTime && (
                      <p>Takes just {formatETA(order.estimatedDeliveryTime)} </p>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
