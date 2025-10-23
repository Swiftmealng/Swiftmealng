import React, { useContext } from 'react';
import { CheckIcon } from "@heroicons/react/solid";
import { OrderContext } from '../hooks/OrderContext';

const steps = [
  {
    name: "Placed",
    description: "Your Order was successfully Placed.",
    href: "#",
    status: "complete",
  },
  {
    name: "Accepted",
    description: "Your Order has been accepted.",
    href: "#",
    status: "complete",
  },
  {
    name: "Preparing",
    description: "Your Order has been Prepared.",
    href: "#",
    status: "complete",
  },
  {
    name: "Out for Delivery",
    description: "Your Order is out for Delivery.",
    href: "#",
    status: "current",
  },
  {
    name: "Delivered",
    description: "Your Order will soon be delivered.",
    href: "#",
    status: "upcoming",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const OrderProgress = () => {
  const {orderProgress} = useContext(OrderContext);
  
  const isStepComplete = (stepName) => {
    switch (orderProgress) {
      case "placed":
        return stepName === "Placed";
      
      case "confirmed":
        return ["Placed", "Accepted"].includes(stepName);
      
      case "preparing":
      case "ready":
        return ["Placed", "Accepted", "Preparing"].includes(stepName);
      
      case "out_for_delivery":
        return ["Placed", "Accepted", "Preparing", "Out for Delivery"].includes(stepName);
      
      case "delivered":
        return ["Placed", "Accepted", "Preparing", "Out for Delivery", "Delivered"].includes(stepName);
      
      case "cancelled":
        return false; // No steps complete for cancelled orders
      
      default:
        return false;
    }
  };
  
  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? "pb-10" : "",
              "relative"
            )}
          >
            {isStepComplete(step.name) ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-secondary"
                    aria-hidden="true"
                  />
                ) : null}
                <a href={step.href} className="relative flex items-start group">
                  <span className="h-9 flex items-center">
                    <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-green-500 rounded-full group-hover:bg-secondary">
                      <CheckIcon
                        className="w-5 h-5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                  <span className="ml-4 min-w-0 flex flex-col">
                    <span className="text-xs font-semibold tracking-wide uppercase">
                      {step.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {step.description}
                    </span>
                  </span>
                </a>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="-ml-px absolute mt-0.5 top-4 left-4 w-0.5 h-full bg-gray-300"
                    aria-hidden="true"
                  />
                ) : null}
                <a
                  href={step.href}
                  className="relative flex items-start group"
                  aria-current={step.name === "Out for Delivery" ? "step" : undefined}
                >
                  <span className="h-9 flex items-center" aria-hidden="true">
                    <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full group-hover:border-gray-400">
                      <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300" />
                    </span>
                  </span>
                  <span className="ml-4 min-w-0 flex flex-col">
                    <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                      {step.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {step.description}
                    </span>
                  </span>
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
