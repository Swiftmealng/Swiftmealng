import React from "react";
import { assets } from "../assets/assets";
import { DriversDetails } from "../components/DriversDetails";
import { ArrowLeft, Clock, MapPin } from "lucide-react";

export const DeliveryDetails = () => {
  return (
    <div className="bg-white">
      <div className="flex flex-col border-b border-gray-200 lg:border-0">
        <div className="relative">
          <div
            aria-hidden="true"
            className="hidden absolute w-1/2 h-full bg-gray-100 lg:block"
          />
          <div className="relative bg-gray-100 lg:bg-transparent">
            <div className="max-w-8xl mx-aut px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-2">
              <div className="max-w-2xl mx-auto py-24 lg:py-14 lg:max-w-none">
                <div className="lg:pr-16">
                  <DriversDetails />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-100 sm:h-154 lg:absolute lg:top-0 lg:right-0 lg:w-1/2 lg:h-full">
            <img
              src={assets.mapPoint}
              alt=""
              className="w-full h-full object-center object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
