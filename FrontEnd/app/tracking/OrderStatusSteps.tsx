import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  Smile,
} from "lucide-react";

interface Props {
  currentStatus: "Confirmed" | "Processing" | "Shipped" | "Delivered";
}

const statusSteps = [
  { label: "Confirmed", icon: Clock },
  { label: "Processing", icon: Package },
  { label: "Shipped", icon: Truck },
  { label: "Delivered", icon: Smile },
];

export default function OrderStatusSteps({ currentStatus }: Props) {
  const currentIndex = statusSteps.findIndex((s) => s.label === currentStatus);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-4">
      {statusSteps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full
                ${isCompleted ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}
            >
              <Icon size={20} />
            </div>
            <span className={`text-sm ${isCompleted ? "text-black" : "text-gray-400"}`}>
              {step.label}
            </span>
            {index < statusSteps.length - 1 && (
              <div className="hidden sm:block w-8 h-1 bg-gray-300 mx-2 rounded" />
            )}
          </div>
        );
      })}
    </div>
  );
}
