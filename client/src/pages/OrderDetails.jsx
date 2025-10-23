import { useNavigate } from "react-router-dom";
import { OrderProgress } from "../components/OrderProgress";
import { OrderInfo } from "../components/OrderInfo";
import { Button } from "@headlessui/react";
import { useContext } from "react";
import { OrderContext } from "../hooks/OrderContext";

export const OrderDetails = () => {
  const navigate = useNavigate()
  const {orderNumber} = useContext(OrderContext)

  return (
    <div className="bg-white">
      <div className="flex flex-col border-b border-gray-200 lg:border-0">
        <div className="flex flexCenter flex-col xl:flex-row">
          <div className="relative bg-gray-100 lg:bg-transparent">
            <div className="max-w-7xl mx-aut px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-2">
              <div className="w-2xl mx-auto pr-12 py-24 lg:pb-10 lg:pt-2 lg:max-w-none">
                <div className="lg:pr-1">
                  <OrderInfo />
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="hidden absolute w-full h-full bg-gray-100 lg:block"
            />
            <div className="relative bg-gray-100 lg:bg-transparent">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-1">
                <div className="max-w-2xl mx-auto py-24 lg:py-14 lg:max-w-none">
                  <div
                    className="lg:pr
                  l-16"
                  >
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl xl:text-5xl">
                      Your Order has been processed
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 mb-10">
                      Food no be just fuel na joy, na comfort, na energy for
                      Lagos life. We dey exist to bring am to you faster,
                      fresher, and stress-free.
                    </p>
                    <OrderProgress />
                    <div className="mt-8">
                      <Button
                        onClick={()=>{navigate(`/DeliveryDetails/${orderNumber}`);}}
                        className="inline-block bg-secondary border border-transparent py-3 px-8 rounded-md font-medium text-white text-center hover:bg-tertiary w-1/2"
                      >
                        View Delivery
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
