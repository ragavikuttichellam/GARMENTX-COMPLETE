import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, Home, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

const PaymentFailedPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Error Message */}
        <div className="text-center mb-8">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-lg text-gray-600">Unfortunately, your payment could not be processed</p>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-t-4 border-red-500">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-gray-900 font-mono">{orderId}</p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
            <h2 className="font-semibold text-red-900 mb-2">What went wrong?</h2>
            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>Your payment was declined by the bank</li>
              <li>You may have cancelled the payment</li>
              <li>There was a technical issue during processing</li>
              <li>Insufficient funds in your account</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-2">What can you do?</h2>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Try using a different payment method</li>
              <li>Check if your card/UPI limit has been reached</li>
              <li>Verify your card details and try again</li>
              <li>Contact your bank for more information</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/checkout')}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-colors"
          >
            Retry Payment
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="border-2 border-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Return to Cart
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Still Need Help?
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Contact Support:</span>{' '}
              <a href="mailto:support@garmentx.com" className="text-pink-500 hover:text-pink-600 font-semibold">
                support@garmentx.com
              </a>
            </p>
            <p>
              <span className="font-semibold">Call Us:</span>{' '}
              <a href="tel:+919876543210" className="text-pink-500 hover:text-pink-600 font-semibold">
                +91 98765 43210
              </a>
            </p>
            <p>
              <span className="font-semibold">WhatsApp:</span>{' '}
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600 font-semibold">
                Chat with us
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentFailedPage;
