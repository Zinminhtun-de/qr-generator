// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Download, 
//   Upload, 
//   Type, 
//   Palette, 
//   Image as ImageIcon,
//   CheckCircle2,
//   Zap,
//   Layout
// } from 'lucide-react';

// export default function CustomizeQRCodeWithQRStyling() {
//   const [text, setText] = useState('https://google.com');
//   const [fgColor, setFgColor] = useState('#000000');
//   const [bgColor, setBgColor] = useState('#ffffff');
//   const [dotType, setDotType] = useState('rounded');
//   const [cornerType, setCornerType] = useState('extra-rounded');
//   const [logo, setLogo] = useState(null);
//   const [logoSize, setLogoSize] = useState(0.2);
//   const canvasRef = useRef(null);
//   const qrCodeInstance = useRef(null);

//   useEffect(() => {
//     // Load qr-code-styling from CDN
//     const script = document.createElement('script');
//     script.src = "https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js";
//     script.async = true;
//     script.onload = () => {
//       // Initialize the styling instance
//       qrCodeInstance.current = new window.QRCodeStyling({
//         width: 1000,
//         height: 1000,
//         type: "canvas",
//         data: text,
//         image: logo,
//         dotsOptions: {
//           color: fgColor,
//           type: dotType // 'rounded', 'dots', 'classy', etc.
//         },
//         backgroundOptions: {
//           color: bgColor,
//         },
//         imageOptions: {
//           crossOrigin: "anonymous",
//           margin: 10,
//           imageSize: logoSize
//         },
//         cornersSquareOptions: {
//           color: fgColor,
//           type: cornerType // 'extra-rounded', 'dot', 'square'
//         },
//         cornersDotOptions: {
//           color: fgColor,
//           type: dotType === 'dots' ? 'dot' : 'square'
//         },
//         qrOptions: {
//           errorCorrectionLevel: "H"
//         }
//       });

//       if (canvasRef.current) {
//         canvasRef.current.innerHTML = "";
//         qrCodeInstance.current.append(canvasRef.current);
//       }
//     };
//     document.body.appendChild(script);

//     return () => {
//       if (script.parentNode) {
//         script.parentNode.removeChild(script);
//       }
//     };
//   }, []);

//   // Update QR Code when dependencies change
//   useEffect(() => {
//     if (qrCodeInstance.current) {
//       qrCodeInstance.current.update({
//         data: text,
//         image: logo,
//         dotsOptions: {
//           color: fgColor,
//           type: dotType
//         },
//         backgroundOptions: {
//           color: bgColor
//         },
//         cornersSquareOptions: {
//           type: cornerType
//         },
//         imageOptions: {
//           imageSize: logoSize
//         }
//       });
//     }
//   }, [text, fgColor, bgColor, dotType, cornerType, logo, logoSize]);

//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => setLogo(event.target.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   const download = () => {
//     if (qrCodeInstance.current) {
//       qrCodeInstance.current.download({ name: "premium-qr", extension: "png" });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] p-4 md:p-12 font-sans selection:bg-blue-100">
//       <div className="max-w-6xl mx-auto">
//         <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <span className="bg-blue-600 text-white p-1 rounded-lg">
//                 <Zap size={20} fill="currentColor" />
//               </span>
//               <h1 className="text-3xl font-black tracking-tighter uppercase italic">Studio QR</h1>
//             </div>
//             <p className="text-slate-500 font-medium">Powered by Premium QR Engines</p>
//           </div>
//           <div className="flex gap-3">
//             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 shadow-sm">
//               <CheckCircle2 size={14} className="text-blue-500" /> IOS OPTIMIZED
//             </div>
//             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 shadow-sm">
//               <CheckCircle2 size={14} className="text-blue-500" /> PRINT READY
//             </div>
//           </div>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
//           <div className="lg:col-span-7 space-y-8">
//             {/* Input */}
//             <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
//               <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
//                 <Type size={16} /> Content link
//               </label>
//               <input 
//                 type="text" 
//                 value={text} 
//                 onChange={(e) => setText(e.target.value)}
//                 className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-semibold text-lg"
//                 placeholder="https://..."
//               />
//             </section>

//             {/* Visuals */}
//             <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
//               <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
//                 <Palette size={16} /> Design Palette
//               </label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-6">
//                   <div>
//                     <span className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Dots Style</span>
//                     <div className="flex flex-wrap gap-2">
//                       {['rounded', 'dots', 'classy', 'square'].map(t => (
//                         <button 
//                           key={t}
//                           onClick={() => setDotType(t)}
//                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dotType === t ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
//                         >
//                           {t.charAt(0).toUpperCase() + t.slice(1)}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                   <div>
//                     <span className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Corner Style</span>
//                     <div className="flex flex-wrap gap-2">
//                       {['extra-rounded', 'dot', 'square'].map(t => (
//                         <button 
//                           key={t}
//                           onClick={() => setCornerType(t)}
//                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${cornerType === t ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
//                         >
//                           {t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="space-y-6">
//                   <div className="flex gap-4">
//                     <div className="flex-1">
//                       <span className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Primary</span>
//                       <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
//                         <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent" />
//                         <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">{fgColor}</span>
//                       </div>
//                     </div>
//                     <div className="flex-1">
//                       <span className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Background</span>
//                       <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
//                         <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent" />
//                         <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">{bgColor}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </section>

//             {/* Branding */}
//             <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
//               <div className="flex items-center justify-between mb-6">
//                 <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
//                   <ImageIcon size={16} /> Branding
//                 </label>
//                 {logo && (
//                   <button onClick={() => setLogo(null)} className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase transition-colors">
//                     Remove logo
//                   </button>
//                 )}
//               </div>
//               <div className="flex flex-col md:flex-row items-center gap-8">
//                 <label className="w-full md:w-1/2 cursor-pointer group">
//                   <div className="h-32 border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50/30 rounded-[1.5rem] flex flex-col items-center justify-center transition-all">
//                     <Upload className="text-slate-300 group-hover:text-blue-500 mb-2 transition-transform group-hover:-translate-y-1" size={24} />
//                     <span className="text-[11px] font-black text-slate-400 uppercase">Drop logo here</span>
//                     <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
//                   </div>
//                 </label>
//                 <div className="w-full md:w-1/2 space-y-4">
//                    <div>
//                     <div className="flex justify-between mb-3">
//                       <span className="text-[10px] font-black text-slate-400 uppercase">Logo Intensity</span>
//                       <span className="text-[10px] font-black text-blue-600">{(logoSize * 100).toFixed(0)}%</span>
//                     </div>
//                     <input 
//                       type="range" min="0.1" max="0.35" step="0.01"
//                       value={logoSize} 
//                       onChange={(e) => setLogoSize(parseFloat(e.target.value))} 
//                       className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" 
//                     />
//                   </div>
//                   <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
//                     Note: QR-Code-Styling uses advanced Error Correction (H) to keep scans reliable even with large logos.
//                   </p>
//                 </div>
//               </div>
//             </section>
//           </div>

//           {/* Render Area */}
//           <div className="lg:col-span-5">
//             <div className="sticky top-12 flex flex-col items-center">
//               <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 w-full flex flex-col items-center">
//                 <div className="relative group p-4 bg-[#f1f5f9] rounded-[2.5rem] shadow-inner border border-slate-100">
//                   <div 
//                     ref={canvasRef} 
//                     className="[&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:rounded-2xl"
//                     style={{ width: '320px', height: '320px' }}
//                   />
//                 </div>

//                 <div className="mt-12 w-full space-y-4">
//                   <button 
//                     onClick={download}
//                     className="group relative w-full bg-[#0f172a] hover:bg-black text-white font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-3 overflow-hidden shadow-2xl shadow-blue-900/20 active:scale-[0.98]"
//                   >
//                     <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
//                     EXPORT PNG
//                   </button>
//                   <div className="flex items-center justify-center gap-4 py-2">
//                     <div className="h-px bg-slate-200 flex-1"></div>
//                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Vector Precision</span>
//                     <div className="h-px bg-slate-200 flex-1"></div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="mt-8 bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-200 flex items-start gap-4 max-w-[340px]">
//                 <Layout size={40} className="shrink-0 opacity-50" />
//                 <p className="text-xs font-bold leading-relaxed">
//                   The <span className="underline underline-offset-4 decoration-white/30">qr-code-styling</span> engine generates premium dots and corner patterns that are significantly easier for iPhone cameras to focus on.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }