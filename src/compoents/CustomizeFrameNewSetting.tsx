import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Type, Palette, Image as ImageIcon, Layout, QrCode,
  RotateCcw, Flower2, Camera, Leaf, Zap, Tag, AlignLeft,
  AlignCenter, AlignRight, Pipette, Layers, Flower
} from 'lucide-react';

// --- Types & Constants ---
type TabId = 'content' | 'style' | 'logo' | 'frames';
type DotType = 'square' | 'rounded' | 'dots' | 'classy';
type FrameId = 'none' | 'modern' | 'minimal' | 'floral' | 'wave' | 'rose';
type GradientType = 'none' | 'linear' | 'radial';
type Alignment = 'left' | 'center' | 'right';

const SCRIPTS = {
  QR_STYLING: "https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js",
  HTML_TO_IMAGE: "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js"
};

// --- Component: UI Sections ---
const SectionHeader: React.FC<{ icon: any, label: string, colorClass?: string }> = ({ icon: Icon, label, colorClass = "text-slate-400" }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon className={`w-4 h-4 ${colorClass}`} />
    <label className="block text-sm font-bold text-slate-700 uppercase tracking-tighter">{label}</label>
  </div>
);

const ColorInput: React.FC<{ value: string, onChange: (val: string) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-3">
    <input 
      type="color" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 flex-shrink-0" 
    />
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="flex-1 bg-white px-3 py-2 rounded-lg text-xs font-mono border border-slate-200 focus:outline-none focus:border-indigo-500" 
    />
  </div>
);

// --- Main App ---
const CustomizeFrameNewSetting: React.FC = () => {
  // --- State: Content ---
  const [url, setUrl] = useState<string>('example.com');
  const [activeTab, setActiveTab] = useState<TabId>('content');
  
  // --- State: Style ---
  const [dotColor, setDotColor] = useState<string>('#4f46e5');
  const [dotType, setDotType] = useState<DotType>('rounded');
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [gradientColor, setGradientColor] = useState<string>('#ec4899');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [bgGradientType, setBgGradientType] = useState<GradientType>('none');
  const [bgGradientColor, setBgGradientColor] = useState<string>('#f1f5f9');
  const [cornerType, ] = useState<string>('extra-rounded');

  // --- State: Branding & Frames ---
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(0.2);
  const [frame, setFrame] = useState<FrameId>('rose');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [labelAlign, setLabelAlign] = useState<Alignment>('center');
  const [labelColor, setLabelColor] = useState<string>('#1e293b');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // --- Refs ---
  const qrRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // --- Optimization: Memoized Label Data ---
  const labelData = useMemo(() => {
    if (customLabel.trim()) return { prefix: '', value: customLabel };
    if (!url.trim()) return { prefix: 'Scan', value: 'Ready' };
    const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);
    if (isUrl) {
      const domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      return { prefix: 'Link', value: domain };
    }
    return { prefix: 'Text', value: url };
  }, [customLabel, url]);

  // --- Optimization: Memoized QR Config ---
  const qrOptions = useMemo(() => {
    let finalData = url;
    const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);
    if (!isUrl && url.trim().length > 0) finalData = "https://example.com";
    else if (isUrl && !url.startsWith('http')) finalData = `https://${url}`;

    return {
      width: 300,
      height: 300,
      data: finalData || 'https://example.com',
      image: logo,
      dotsOptions: {
        color: gradientType === 'none' ? dotColor : undefined,
        type: dotType,
        gradient: gradientType !== 'none' ? {
          type: gradientType,
          rotation: 45,
          colorStops: [{ offset: 0, color: dotColor }, { offset: 1, color: gradientColor }]
        } : null
      },
      backgroundOptions: { 
        color: bgGradientType === 'none' ? bgColor : undefined,
        gradient: bgGradientType !== 'none' ? {
          type: bgGradientType,
          rotation: 45,
          colorStops: [{ offset: 0, color: bgColor }, { offset: 1, color: bgGradientColor }]
        } : null
      },
      imageOptions: { crossOrigin: "anonymous", margin: 10, imageSize: logoSize },
      cornersSquareOptions: { color: gradientType === 'none' ? dotColor : undefined, type: cornerType },
      qrOptions: { errorCorrectionLevel: 'H' }
    };
  }, [url, dotColor, dotType, bgColor, cornerType, gradientType, gradientColor, bgGradientType, bgGradientColor, logo, logoSize]);

  // --- QR Engine Lifecycle ---
  useEffect(() => {
    const loadScript = (src: string) => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    Promise.all([loadScript(SCRIPTS.QR_STYLING), loadScript(SCRIPTS.HTML_TO_IMAGE)]).then(() => {
            //@ts-ignore

      if (window.QRCodeStyling && qrRef.current) {
            //@ts-ignore

        window.qrCodeInstance = new window.QRCodeStyling(qrOptions);
            //@ts-ignore

        window.qrCodeInstance.append(qrRef.current);
      }
    });
  }, []);

  useEffect(() => {
        //@ts-ignore

    if (window.qrCodeInstance) window.qrCodeInstance.update(qrOptions);
  }, [qrOptions]);

  // --- Handlers ---
      //@ts-ignore

  const handleLogoUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLogo(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const downloadFullDesign = useCallback(async () => {
    //@ts-ignore
    if (!window.htmlToImage || !frameRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise(r => setTimeout(r, 100));
          //@ts-ignore

      const dataUrl = await window.htmlToImage.toPng(frameRef.current, { quality: 1, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `qr-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-full md:w-20 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex md:flex-col items-center py-4 md:py-8 gap-6 px-4 md:px-0 z-20">
        <div className="hidden md:flex mb-6 bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
          <QrCode className="text-white w-6 h-6" />
        </div>
        {[
          { id: 'content', icon: Type, label: 'Content' },
          { id: 'style', icon: Palette, label: 'Style' },
          { id: 'logo', icon: ImageIcon, label: 'Logo' },
          { id: 'frames', icon: Layout, label: 'Frames' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* EDITOR PANEL */}
      <div className="w-full md:w-96 bg-white shadow-xl z-10 overflow-y-auto">
        <div className="p-6 pb-24">
          <header className="mb-8">
            <h1 className="text-2xl font-black tracking-tight">QR Design Pro</h1>
            <p className="text-slate-500 text-sm italic">Optimized Engine v2.0</p>
          </header>

          {activeTab === 'content' && (
            <div className="space-y-6 animate-in">
              <div>
                <SectionHeader icon={Type} label="QR Content" />
                <textarea 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-4 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium min-h-[120px] resize-none"
                  placeholder="Type anything..."
                />
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-8 animate-in">
              <section className="space-y-4">
                <SectionHeader icon={Palette} label="1. Pattern Shape" />
                <div className="grid grid-cols-4 gap-2">
                  {(['square', 'rounded', 'dots', 'classy'] as DotType[]).map((type) => (
                    <button key={type} onClick={() => setDotType(type)} className={`p-2 rounded-lg border-2 text-[10px] font-black uppercase transition-all ${dotType === type ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200'}`}>{type}</button>
                  ))}
                </div>
              </section>

              {/* PATTERN COLOR */}
              <section className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <SectionHeader icon={Zap} label="2. Pattern Color" colorClass="text-amber-500" />
                <div className="grid grid-cols-3 gap-2">
                  {(['none', 'linear', 'radial'] as GradientType[]).map((g) => (
                    <button key={g} onClick={() => setGradientType(g)} className={`py-2 px-1 rounded-lg border-2 text-[10px] font-black uppercase transition-all ${gradientType === g ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-white bg-white hover:border-slate-200 text-slate-400'}`}>{g === 'none' ? 'Solid' : g}</button>
                  ))}
                </div>
                <ColorInput value={dotColor} onChange={setDotColor} />
                {gradientType !== 'none' && <ColorInput value={gradientColor} onChange={setGradientColor} />}
              </section>

              {/* BACKGROUND COLOR */}
              <section className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-4">
                <SectionHeader icon={Layers} label="3. Background Color" colorClass="text-indigo-500" />
                <div className="grid grid-cols-3 gap-2">
                  {(['none', 'linear', 'radial'] as GradientType[]).map((g) => (
                    <button key={g} onClick={() => setBgGradientType(g)} className={`py-2 px-1 rounded-lg border-2 text-[10px] font-black uppercase transition-all ${bgGradientType === g ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-white bg-white hover:border-slate-200 text-slate-400'}`}>{g === 'none' ? 'Solid' : g}</button>
                  ))}
                </div>
                <ColorInput value={bgColor} onChange={setBgColor} />
                {bgGradientType !== 'none' && <ColorInput value={bgGradientColor} onChange={setBgGradientColor} />}
              </section>
            </div>
          )}

          {activeTab === 'logo' && (
            <div className="space-y-6 animate-in">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center relative hover:border-indigo-400 transition-colors">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700 mt-2">Upload Center Logo</p>
              </div>
              {logo && (
                <div className="space-y-4">
                   <button onClick={() => setLogo(null)} className="w-full py-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg">Remove Logo</button>
                   <input type="range" min="0.1" max="0.4" step="0.05" value={logoSize} onChange={(e) => setLogoSize(parseFloat(e.target.value))} className="w-full accent-indigo-600" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'frames' && (
            <div className="space-y-8 animate-in">
              <section>
                <SectionHeader icon={Tag} label="Frame Label" />
                <input 
                  type="text" 
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="w-full p-4 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium mb-4"
                  placeholder="e.g. Scan Me..."
                />
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <SectionHeader icon={Pipette} label="Label Color" />
                  <ColorInput value={labelColor} onChange={setLabelColor} />
                </div>
                <div className="flex gap-2 mt-4">
                  {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => {
                    const id = ['left', 'center', 'right'][i] as Alignment;
                    return (
                      <button key={id} onClick={() => setLabelAlign(id)} className={`flex-1 flex justify-center py-2 rounded-lg border-2 transition-all ${labelAlign === id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <SectionHeader icon={Layout} label="Layout Presets" />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'modern', label: 'Modern' },
                    { id: 'minimal', label: 'Minimal' },
                    { id: 'floral', label: '🌸 Garden' },
                    { id: 'rose', label: '🌹 Rose' },
                    { id: 'wave', label: '🌊 Wave' }
                  ].map((f) => (
                    <button key={f.id} onClick={() => setFrame(f.id as FrameId)} className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-left capitalize ${frame === f.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW CANVAS */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-white">
        <div 
          ref={frameRef}
          className={`transition-all duration-700 flex flex-col items-center relative overflow-hidden
            ${frame === 'modern' ? 'p-1 bg-white rounded-[40px] shadow-2xl border-[12px] border-slate-900' : ''}
            ${frame === 'minimal' ? 'p-10 bg-white rounded-3xl shadow-xl' : ''}
            ${frame === 'floral' ? 'p-16 bg-gradient-to-br from-pink-50 via-white to-emerald-50 rounded-[80px] shadow-2xl' : ''}
            ${frame === 'rose' ? 'p-16 bg-gradient-to-tr from-rose-100 via-white to-red-50 rounded-[40px] shadow-2xl border-2 border-rose-200' : ''}
            ${frame === 'wave' ? 'p-16 bg-white rounded-[60px] shadow-2xl border border-slate-100' : ''}
            ${frame === 'none' ? 'p-6 bg-white rounded-2xl shadow-sm' : ''}
          `}
        >
          {frame === 'wave' && (
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
              <svg className="relative block w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-indigo-600 opacity-60"></path>
              </svg>
            </div>
          )}

          {frame === 'floral' && (
             <div className="absolute -top-6 -left-6 text-pink-400 rotate-[-15deg]"><Flower2 size={84} fill="currentColor" opacity={0.6} /></div>
          )}

          {frame === 'rose' && (
            <>
              <div className="absolute top-2 left-2 text-rose-600 rotate-[-20deg] opacity-70">
                <Flower size={48} fill="currentColor" strokeWidth={1} />
              </div>
              <div className="absolute bottom-16 right-4 text-rose-800 rotate-[15deg] opacity-60">
                <Flower size={64} fill="currentColor" strokeWidth={1} />
              </div>
              <div className="absolute top-1/3 -right-4 text-rose-400 rotate-[45deg] opacity-30">
                <Leaf size={32} fill="currentColor" />
              </div>
            </>
          )}

          <div ref={qrRef} className="relative z-10" />

          {frame !== 'none' && (
            <div className={`mt-8 w-full px-8 z-10 text-${labelAlign}`}>
               <p style={{ color: labelColor }} className="font-bold text-sm tracking-widest uppercase">
                 {labelData.prefix}{labelData.prefix && ': '}{labelData.value}
               </p>
            </div>
          )}
        </div>

        <button 
          onClick={downloadFullDesign}
          disabled={isCapturing}
          className="mt-12 flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          <Camera className={isCapturing ? 'animate-spin' : ''} />
          {isCapturing ? 'Saving...' : 'Download Design'}
        </button>

        <button onClick={() => window.location.reload()} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-indigo-600"><RotateCcw size={20} /></button>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.4s ease-out forwards; }
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
      `}</style>
    </div>
  );
};

export default CustomizeFrameNewSetting;