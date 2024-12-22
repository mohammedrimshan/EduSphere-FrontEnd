import React from 'react';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from 'lucide-react';
import useCallContext from "@/lib/callProvider";

export function CallPopup({ onAnswer }) {
  const { incomingCallInfo, endCall } = useCallContext();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Incoming Call</h2>
        <p className="mb-4">
          {incomingCallInfo?.callerData?.name || "Unknown"} is calling you.
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={onAnswer}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Phone className="mr-2 h-4 w-4" /> Answer
          </Button>
          <Button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="mr-2 h-4 w-4" /> Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
