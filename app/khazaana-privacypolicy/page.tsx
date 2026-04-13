import React from 'react';

export default function KhazaanaPrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="mb-16">
        <h1 className="text-4xl font-black text-[#0f172a] tracking-tight mb-4">Privacy Policy for Khazaana Lottery Results</h1>
        <div className="flex flex-col gap-2">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Effective Date: August 17, 2025</p>
          <div className="w-20 h-1.5 bg-[#f59e0b] rounded-full"></div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-10 text-slate-600 leading-relaxed font-medium">
        <section>
          <p>
            VS Tech built the Khazaana Lottery Results app as a Free app. This SERVICE is provided by VS Tech at no cost and is intended for use as is.
          </p>
          <p className="mt-4">
            This page is used to inform visitors regarding our policies with the collection, use, and disclosure of Personal Information if anyone decides to use our Service. By using the Khazaana app, you agree to the collection and use of information in accordance with this policy. The Personal Information we collect is used for providing and improving the Service. We do not use or share your information with anyone except as described in this Privacy Policy.
          </p>
          <p className="mt-4 italic">
            The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, unless otherwise defined.
          </p>
        </section>

        <section className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm">
          <h2 className="text-2xl font-black text-[#0f172a] mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs">01</span>
            Information Collection and Use
          </h2>
          <p>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your data when you use our app and its services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-[#0f172a] mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs">02</span>
            Information We Collect
          </h2>
          <p className="mb-4">We may collect the following types of data:</p>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="mt-1.5 w-1.5 h-1.5 bg-[#f59e0b] rounded-full shrink-0"></div>
              <div><strong>Device Information:</strong> Including device type, OS, and unique identifiers for advertising and analytics.</div>
            </li>
            <li className="flex gap-4">
              <div className="mt-1.5 w-1.5 h-1.5 bg-[#f59e0b] rounded-full shrink-0"></div>
              <div><strong>Usage Data:</strong> Information about your interaction with the app, such as pages visited and features used.</div>
            </li>
            <li className="flex gap-4">
              <div className="mt-1.5 w-1.5 h-1.5 bg-[#f59e0b] rounded-full shrink-0"></div>
              <div><strong>Lottery Data:</strong> Ticket numbers or scanned information you submit to check results.</div>
            </li>
          </ul>
        </section>

        <section className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200">
          <h2 className="text-2xl font-black mb-6 text-[#f59e0b]">Prediction Chat Feature</h2>
          <p className="text-slate-400 mb-6">
            Our app includes a “Prediction Chat” feature that allows users to communicate with each other. To use this feature, we collect the following information:
          </p>
          <ul className="space-y-6">
            <li>
              <h3 className="text-[#f59e0b] font-bold uppercase tracking-widest text-[10px] mb-2">Username</h3>
              <p className="text-sm">We collect a username that you choose. This username is publicly visible to other users in the chat. We <strong>do not</strong> ask for or collect your real name, email address, or phone number for this feature.</p>
            </li>
            <li>
              <h3 className="text-[#f59e0b] font-bold uppercase tracking-widest text-[10px] mb-2">Chat Messages</h3>
              <p className="text-sm">The messages you send are stored temporarily to be displayed to other users.</p>
            </li>
            <li>
              <h3 className="text-[#f59e0b] font-bold uppercase tracking-widest text-[10px] mb-2">Data Storage and Deletion</h3>
              <p className="text-sm">All chat messages and associated usernames are stored on Google’s secure Firebase servers. To protect your privacy, all chat messages are <strong>automatically and permanently deleted after 30 days.</strong></p>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-black text-[#0f172a] mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs">03</span>
            Third-Party Services
          </h2>
          <p className="mb-6">The app uses third-party services that may collect information used to identify you. Privacy policies of third-party providers used by the app:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Google Play Services', 'AdMob', 'Google Analytics for Firebase', 'Firebase Crashlytics'].map((service) => (
              <div key={service} className="p-4 bg-white border border-slate-100 rounded-xl font-bold text-sm text-slate-700">
                {service}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black text-[#0f172a] mb-4">Log Data</h2>
          <p>
            In case of an error, we may collect data and information (via third-party tools) on your device, including your IP address, device name, OS version, app configuration, time and date of error, and other diagnostic data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-[#0f172a] mb-4">Children’s Privacy</h2>
          <p>
            This app does not knowingly collect information from children under 13. If we become aware of such data, we will delete it immediately. Parents/guardians can contact us to request deletion.
          </p>
        </section>

        <section className="p-8 bg-amber-50 border border-amber-100 rounded-3xl">
          <h2 className="text-2xl font-black text-amber-900 mb-4">Disclaimer</h2>
          <p className="text-amber-800 text-sm italic">
            Khazaana Lottery Results is not affiliated with any government entity. We do not sell lottery tickets or facilitate official government services. All information provided is sourced from publicly available and official government websites. Always verify results with the official government gazette or trusted sources.
          </p>
        </section>

        <section className="pt-10 border-t border-slate-100">
          <h2 className="text-2xl font-black text-[#0f172a] mb-6">Contact Us</h2>
          <p className="mb-4">If you have any questions or suggestions regarding this Privacy Policy, please contact:</p>
          <div className="inline-block px-6 py-3 bg-[#0f172a] text-[#f59e0b] rounded-xl font-black">
            ramvijaycse90@gmail.com
          </div>
        </section>
      </div>
    </div>
  );
}
