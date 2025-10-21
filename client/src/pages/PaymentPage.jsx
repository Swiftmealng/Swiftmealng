import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, bank_transfer, wallet
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // TODO: Connect to backend API
        // const response = await fetch(`API_URL/orders/${orderId}`);
        // const data = await response.json();
        
        // Simulate API call
        setTimeout(() => {
          setOrder({
            id: orderId,
            total: 5000,
            items: [
              { name: 'Jollof Rice with Chicken', quantity: 2, price: 2500 }
            ],
            deliveryFee: 500,
            serviceCharge: 250
          });
        }, 500);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/gi, '').substring(0, 3);
    }

    setCardDetails({ ...cardDetails, [field]: formattedValue });
    setError('');
  };

  const validateCard = () => {
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      if (!cardDetails.cardName) {
        setError('Please enter the cardholder name');
        return false;
      }
      if (!cardDetails.expiryDate || cardDetails.expiryDate.length !== 5) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
        setError('Please enter a valid 3-digit CVV');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateCard()) return;

    setIsProcessing(true);
    setError('');

    try {
      // TODO: Integrate Paystack or Flutterwave
      // For Paystack:
      // const handler = PaystackPop.setup({
      //   key: 'your-paystack-public-key',
      //   email: customerEmail,
      //   amount: order.total * 100, // Amount in kobo
      //   currency: 'NGN',
      //   ref: orderId,
      //   callback: function(response) {
      //     // Verify payment on backend
      //     verifyPayment(response.reference);
      //   },
      //   onClose: function() {
      //     setIsProcessing(false);
      //   }
      // });
      // handler.openIframe();

      // Simulate payment processing
      console.log('Processing payment:', { orderId, paymentMethod, cardDetails });
      
      setTimeout(() => {
        setIsProcessing(false);
        // Navigate to success page
        navigate(`/payment/success/${orderId}`);
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-[#FF0000] rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-600">Order #{orderId}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#FF0000] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="h-8 w-8 mx-auto mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">Card</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#FF0000] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="h-8 w-8 mx-auto mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">Transfer</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-[#FF0000] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="h-8 w-8 mx-auto mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">Wallet</p>
                </button>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardDetails.cardName}
                      onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                      placeholder="JOHN DOE"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                        placeholder="123"
                        maxLength="3"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Bank Transfer Details</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><span className="font-medium">Bank:</span> First Bank of Nigeria</p>
                    <p><span className="font-medium">Account Name:</span> Swiftmeal Nigeria Ltd</p>
                    <p><span className="font-medium">Account Number:</span> 1234567890</p>
                    <p><span className="font-medium">Amount:</span> ₦{order.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-600 mt-2">Please use Order ID as reference</p>
                  </div>
                </div>
              )}

              {/* Wallet Payment */}
              {paymentMethod === 'wallet' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                  <svg className="h-12 w-12 mx-auto text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-sm text-gray-700">Wallet payment coming soon!</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isProcessing || paymentMethod === 'wallet'}
                className="w-full mt-6 py-3 px-4 bg-[#FF0000] text-white rounded-full font-semibold hover:bg-[#E00000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ₦${order.total.toLocaleString()}`
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure payment powered by Paystack</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₦{(order.total - order.deliveryFee - order.serviceCharge).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">₦{order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Charge</span>
                  <span className="text-gray-900">₦{order.serviceCharge.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-3 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-[#FF0000]">₦{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
