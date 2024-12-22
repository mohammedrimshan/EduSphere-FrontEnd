import React from 'react';
import { useCall } from '@/lib/callProvider';

const StudentVideoCall = () => {
  const { myVideo, userVideo, callAccepted, callEnded, stream, call, name, setName, leaveCall, answerCall } = useCall();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Student Video Call</h1>
      <div className="flex flex-wrap justify-center gap-8 mb-8">
        <div className="relative">
          <video playsInline muted ref={myVideo} autoPlay className="w-96 h-72 rounded-lg shadow-lg" />
          <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">You</p>
        </div>
        {callAccepted && !callEnded && (
          <div className="relative">
            <video playsInline ref={userVideo} autoPlay className="w-96 h-72 rounded-lg shadow-lg" />
            <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">Tutor</p>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="px-4 py-2 border rounded-md"
        />
        <div className="flex gap-4">
          {call.isReceivingCall && !callAccepted && (
            <button onClick={answerCall} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              Answer Call
            </button>
          )}
          <button onClick={leaveCall} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentVideoCall;

