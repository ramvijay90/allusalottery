import { Mail, MapPin, Phone, Zap } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 bg-[#0f172a] text-[#f59e0b] px-4 py-2 rounded-full mb-6 shadow-lg shadow-slate-900/20">
          <Zap size={16} />
          <span className="text-xs font-black uppercase tracking-widest text-blue-100">Get in Touch</span>
        </div>
        <h1 className="text-5xl font-black text-[#0f172a] tracking-tighter mb-6">
          Contact Details
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Have questions, suggestions, or need to report an error? We are here to help.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="premium-card p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-blue-100">
            <Mail size={32} />
          </div>
          <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-widest mb-4">Email Us</h3>
          <a href="mailto:mahmahesh1980@gmail.com" className="text-[#f59e0b] font-black text-lg hover:underline break-all">
            mahmahesh1980@gmail.com
          </a>
          <p className="text-slate-400 text-xs mt-4 uppercase font-bold tracking-widest">Response within 24 hours</p>
        </div>

        <div className="premium-card p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-amber-100">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-widest mb-4">Location</h3>
          <p className="text-slate-600 font-bold">
            Online Service Portal<br />
            Global Access
          </p>
          <p className="text-slate-400 text-xs mt-4 uppercase font-bold tracking-widest">allusalottery.com</p>
        </div>

        <div className="premium-card p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-100">
            <Phone size={32} />
          </div>
          <h3 className="text-lg font-black text-[#0f172a] uppercase tracking-widest mb-4">Support</h3>
          <p className="text-slate-600 font-bold underline">
            Email Support Only
          </p>
          <p className="text-slate-400 text-xs mt-4 uppercase font-bold tracking-widest">Available 24/7</p>
        </div>
      </div>
    </div>
  );
}
