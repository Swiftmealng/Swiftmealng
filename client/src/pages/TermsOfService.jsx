import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-8 sm:px-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Terms of Service</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated: October 23, 2025</strong>
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Swiftmealng ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Swiftmealng is an online food delivery platform that connects customers with restaurants and delivery partners. We provide technology services to facilitate food ordering, payment processing, and delivery coordination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Account Registration</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">Account Responsibilities</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>All activities under your account are your responsibility</li>
                <li>You may not transfer or share your account with others</li>
                <li>You must provide valid payment information for orders</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Orders and Payments</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Order Placement</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>All orders are subject to restaurant availability and acceptance</li>
                <li>Prices may vary and are confirmed at checkout</li>
                <li>You agree to pay all charges associated with your orders</li>
                <li>Minimum order requirements may apply</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">Payment Terms</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Payment is processed securely through approved payment methods</li>
                <li>You authorize us to charge your payment method for all orders</li>
                <li>Refunds are processed according to our refund policy</li>
                <li>Additional fees may apply for delivery, service charges, or taxes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Delivery Services</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>You must be present at the delivery address to receive orders</li>
                <li>Delivery fees are calculated based on distance and order value</li>
                <li>We reserve the right to refuse delivery to certain locations</li>
                <li>You are responsible for providing accurate delivery instructions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Conduct</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Harass, abuse, or harm others</li>
                <li>Impersonate any person or entity</li>
                <li>Transmit harmful or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Place fraudulent or misleading orders</li>
                <li>Use the service for commercial purposes without authorization</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Food Safety and Quality</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Food preparation and handling is the responsibility of restaurant partners</li>
                <li>We encourage reporting any food safety concerns immediately</li>
                <li>Allergen information is provided by restaurants and should be verified</li>
                <li>We are not liable for food-related illnesses or allergies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are owned by Swiftmealng and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Service Availability</h3>
              <p className="text-gray-700 mb-4">
                The Service is provided on an "as is" and "as available" basis. We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, Swiftmealng shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to defend, indemnify, and hold harmless Swiftmealng and its officers, directors, employees, and agents from and against any claims, damages, losses, costs, and expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be interpreted and governed by the laws of Nigeria, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Lagos, Nigeria.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after such changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> legal@swiftmealng.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p className="text-gray-700"><strong>Address:</strong> 123 Food Street, Lagos, Nigeria</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;