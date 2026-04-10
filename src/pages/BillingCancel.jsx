import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Home } from 'lucide-react';

export default function BillingCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Canceled</h1>
          <p className="text-gray-600">Your subscription was not completed</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            No charges were made. You can try again anytime from the settings page.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
}