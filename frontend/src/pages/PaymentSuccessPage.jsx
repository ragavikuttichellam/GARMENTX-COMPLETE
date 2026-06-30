import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Mail, Phone, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PaymentSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (error) {
      toast.error('Order not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      const res = await api.get(`/admin/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      a.click();
    } catch (error) {
      toast.error('Error downloading invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">Your order has been confirmed</p>
        </div>

        {order && (
          <div className="space-y-8">
            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-green-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="text-2xl font-bold text-gray-900">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{order.totalAmount?.toLocaleString()}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h2>
                {order.address && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-1">{order.address.fullName}</p>
                    <p className="text-gray-600 mb-1">{order.address.addressLine1}</p>
                    {order.address.addressLine2 && (
                      <p className="text-gray-600 mb-1">{order.address.addressLine2}</p>
                    )}
                    <p className="text-gray-600 mb-1">{order.address.city}, {order.address.state} {order.address.pincode}</p>
                    <p className="text-gray-600 flex items-center gap-2 mt-3">
                      <Phone className="w-4 h-4" />
                      {order.address.phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.color} | {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-8">
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {order.shippingCost === 0 ? <span className="text-green-600">FREE</span> : <>₹{order.shippingCost?.toLocaleString()}</>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="font-semibold text-gray-900">₹{order.tax?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-green-600">₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Payment Method:</span> {order.paymentMethod?.toUpperCase()}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-semibold">Status:</span> <span className="text-green-600 font-semibold">PAID</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={downloadInvoice}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice
                </button>
                <button
                  onClick={() => navigate(`/order/${orderId}`)}
                  className="flex-1 border-2 border-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Track Order
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold text-gray-900">Order Confirmation</p>
                    <p className="text-sm text-gray-600">You'll receive a confirmation email shortly with all details</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold text-gray-900">Processing</p>
                    <p className="text-sm text-gray-600">Your order will be processed within 24 hours</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold text-gray-900">Shipment</p>
                    <p className="text-sm text-gray-600">Track your package in real-time on your orders page</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Need help?</span> Contact our support team at{' '}
                  <a href="tel:+919876543210" className="text-amber-700 hover:text-amber-800 font-semibold">
                    +91 98765 43210
                  </a>{' '}
                  or visit our help center.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
