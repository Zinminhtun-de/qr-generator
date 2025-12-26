import  { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Type, 
  Palette, 
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Layers,
  Move,
  Link as LinkIcon,
  AlertCircle,
  Eye
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 'classic-dark',
    name: 'Classic Dark',
    fg: '#000000',
    bg: '#ffffff',
    dots: 'rounded',
    corners: 'extra-rounded',
    icon: '⬛'
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    fg: '#00f2ff',
    bg: '#000000',
    dots: 'classy',
    corners: 'dot',
    icon: '🧪'
  },
  {
    id: 'luxury',
    name: 'Luxury Gold',
    fg: '#9a780b',
    bg: '#ffffff',
    dots: 'rounded',
    corners: 'extra-rounded',
    icon: '👑'
  },
  {
    id: 'minimal-dots',
    name: 'Modern Dot',
    fg: '#6366f1',
    bg: '#f8fafc',
    dots: 'dots',
    corners: 'dot',
    icon: '⚪'
  },
  {
    id: 'nature',
    name: 'Soft Nature',
    fg: '#065f46',
    bg: '#f0fdf4',
    dots: 'rounded',
    corners: 'extra-rounded',
    icon: '🌿'
  },
  {
    id: 'royal-red',
    name: 'Royal Red',
    fg: '#991b1b',
    bg: '#fff1f2',
    dots: 'classy',
    corners: 'square',
    icon: '🌹'
  }
];

const POSITIONS = [
  { id: 'center', label: 'Center', icon: '🎯' },
  { id: 'top-right', label: 'Top Right', icon: '↗️' },
  { id: 'bottom-left', label: 'Bottom Left', icon: '↙️' },
  { id: 'bottom-right', label: 'Bottom Right', icon: '↘️' }
];

const DEFAULT_SCAN_URL = "https://google.com";

export default function CustomizeQRStudioDefault() {
  const [text, setText] = useState('Word မြန်မာword');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [dotType, setDotType] = useState('rounded');
  const [cornerType, setCornerType] = useState('extra-rounded');
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(0.2);
  const [logoPosition, setLogoPosition] = useState('center');
  const canvasRef = useRef<any |null>(null);
  const qrCodeInstance = useRef<any |null>(null);

  // Checks if input is a valid URL format
  const isUrlFormat = (val:string) => {
    return /^((https?:\/\/)|(www\.))?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(val.trim());
  };

  /**
   * REVISED LOGIC:
   * 1. If empty -> Use Default URL
   * 2. If valid URL -> Use that URL (with https prefix)
   * 3. If plain text -> Use Default URL (but keep text in UI)
   */
  const processInputForQR = (val:string) => {
    const trimmed = val.trim();
    
    // If empty, return the default fallback URL
    if (!trimmed) return DEFAULT_SCAN_URL;

    // If it is a URL, return it formatted
    if (isUrlFormat(trimmed)) {
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://${trimmed}`;
      }
      return trimmed;
    }

    // If it's just text (like "Word မြန်မာword"), return the default scan URL
    return DEFAULT_SCAN_URL;
  };

  const applyTemplate = (tpl:any) => {
    setFgColor(tpl.fg);
    setBgColor(tpl.bg);
    setDotType(tpl.dots);
    setCornerType(tpl.corners);
  };

  const getLogoOptions = (_:any, size:any) => {
    return {
      crossOrigin: "anonymous",
      margin: 10,
      imageSize: size,
      hideBackgroundDots: true
    };
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js";
    script.async = true;
    script.onload = () => {
        //@ts-ignore
      qrCodeInstance.current = new window.QRCodeStyling({
        width: 1000,
        height: 1000,
        type: "canvas",
        data: processInputForQR(text),
        image: logo,
        dotsOptions: { color: fgColor, type: dotType },
        backgroundOptions: { color: bgColor },
        imageOptions: getLogoOptions(logoPosition, logoSize),
        cornersSquareOptions: { color: fgColor, type: cornerType },
        cornersDotOptions: { color: fgColor, type: dotType === 'dots' ? 'dot' : 'square' },
        qrOptions: { 
          errorCorrectionLevel: "H",
          typeNumber: 0,
          mode: 'Byte'
        }
      });

      if (canvasRef.current) {
        canvasRef.current.innerHTML = "";
        qrCodeInstance.current.append(canvasRef.current);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.update({
        data: processInputForQR(text),
        image: logo,
        dotsOptions: { color: fgColor, type: dotType },
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { type: cornerType, color: fgColor },
        cornersDotOptions: { color: fgColor, type: dotType === 'dots' ? 'dot' : 'square' },
        imageOptions: getLogoOptions(logoPosition, logoSize),
        qrOptions: { 
          errorCorrectionLevel: "H",
          typeNumber: 0,
          mode: 'Byte'
        }
      });
    }
  }, [text, fgColor, bgColor, dotType, cornerType, logo, logoSize, logoPosition]);

  const handleLogoUpload = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event:any) => setLogo(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const download = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({ name: "branded-qr", extension: "png" });
    }
  };

  const activeQRContent = processInputForQR(text);
  const isPlainTextInput = text.trim() && !isUrlFormat(text);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] p-4 md:p-8 lg:p-12 font-sans selection:bg-blue-100">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white p-1.5 rounded-xl shadow-lg shadow-indigo-200">
                <Sparkles size={22} fill="currentColor" />
              </span>
              <h1 className="text-3xl font-black tracking-tight uppercase italic text-slate-900">QR DESIGN STUDIO</h1>
            </div>
            <p className="text-slate-500 font-medium text-sm">Professional grade visual templates & branding</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-700 shadow-sm">
              <CheckCircle2 size={16} className="text-green-500" /> TEXT-TO-URL ACTIVE
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Controls Panel */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Input & Styles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {!text.trim() ? <AlertCircle size={16} className="text-amber-500" /> : isUrlFormat(text) ? <LinkIcon size={16} className="text-blue-500" /> : <Type size={16} />} 
                    {!text.trim() ? 'Empty Input' : isUrlFormat(text) ? 'Link Detected' : 'Text Content (Redirects to Default)'}
                  </label>
                  {isPlainTextInput && (
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Redirecting Scans to Default URL</span>
                  )}
                </div>
                <input 
                  type="text" 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl outline-none transition-all font-bold text-lg text-slate-700"
                  placeholder="Paste URL or text..."
                />
                
                {/* Active Scan Information */}
                <div className="mt-4 p-4 bg-slate-900 rounded-2xl flex flex-col gap-2">
                   <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                       <Eye size={12} /> Scanner will see:
                     </span>
                     <span className="text-[9px] font-bold text-indigo-400">ENCODED VALUE</span>
                   </div>
                   <code className="text-[11px] font-mono text-white/90 truncate break-all">
                     {activeQRContent}
                   </code>
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                  <Palette size={16} /> Dot Pattern
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['rounded', 'dots', 'classy', 'square'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setDotType(t)}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${dotType === t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                  <Palette size={16} /> Eye Style
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {['extra-rounded', 'dot', 'square'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setCornerType(t)}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${cornerType === t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {t.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Template Library */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
              <label className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">
                <Layers size={16} /> Fast Templates
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all text-center"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{tpl.icon}</span>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">{tpl.name}</span>
                    <div className="flex gap-1 mt-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tpl.fg }}></div>
                      <div className="w-2 h-2 rounded-full border" style={{ backgroundColor: tpl.bg }}></div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Colors & Logo Placement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                  <Palette size={16} /> Color Settings
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Foreground</span>
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent" title="Foreground Color" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Background</span>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent" title="Background Color" />
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <ImageIcon size={16} /> Branding Logo
                  </label>
                  {logo && (
                    <button onClick={() => setLogo(null)} className="text-[10px] font-black text-rose-500 uppercase hover:text-rose-700 transition-colors">Remove</button>
                  )}
                </div>
                
                <div className="space-y-6">
                  <label className="block w-full cursor-pointer group">
                    <div className="h-24 border-2 border-dashed border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-50/30 rounded-[1.5rem] flex flex-col items-center justify-center transition-all overflow-hidden relative">
                      {logo ? (
                        <img src={logo} alt="Branding Logo" className="h-full w-full object-contain p-4" />
                      ) : (
                        <>
                          <Upload className="text-slate-300 group-hover:text-indigo-500 mb-1 transition-transform group-hover:-translate-y-1" size={20} />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Upload Logo</span>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>

                  {logo && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        <Move size={14} /> Logo Alignment
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {POSITIONS.map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => setLogoPosition(pos.id)}
                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 transition-all text-[10px] font-bold ${
                              logoPosition === pos.id 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span>{pos.icon}</span>
                            {pos.label}
                          </button>
                        ))}
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex justify-between mb-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Image Scale</span>
                          <span className="text-[9px] font-black text-indigo-600">{(logoSize * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          type="range" min="0.05" max="0.30" step="0.01"
                          value={logoSize} 
                          onChange={(e) => setLogoSize(parseFloat(e.target.value))} 
                          className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar / Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-12 flex flex-col items-center">
              <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-900/5 border border-slate-200/50 w-full flex flex-col items-center">
                <div className="relative group p-6 bg-slate-50 rounded-[3rem] shadow-inner border border-slate-200/50">
                  <div 
                    ref={canvasRef} 
                    className="[&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:rounded-[1.5rem] [&>canvas]:shadow-sm transition-transform duration-500"
                    style={{ width: '320px', height: '320px' }}
                  />
                </div>

                <div className="mt-12 w-full space-y-4">
                  <button 
                    onClick={download}
                    className="group relative w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-3 overflow-hidden shadow-2xl shadow-indigo-900/20 active:scale-[0.98]"
                  >
                    <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                    EXPORT TO PNG
                  </button>
                  
                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <p className="text-[10px] font-bold text-indigo-700 leading-relaxed text-center italic">
                      {isPlainTextInput 
                        ? `Encoding Text Content to Default Scan URL: ${DEFAULT_SCAN_URL}` 
                        : isUrlFormat(text) 
                        ? "Active Link: Scanners will navigate directly to your input URL." 
                        : "Empty Input: Defaulting to fallback security URL."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}