import React, { useState, useRef, useEffect, useReducer, useMemo } from 'react';
import { 
  Square, 
  RefreshCcw, 
  Circle, 
  Zap, 
  Ticket,
  Maximize,
  MessageSquare,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Trash2,
  Eye,
  Truck,
  Utensils,
  Wind,
  Flower,
  Trees,
  Settings2,
  FileDown,
  Link as LinkIcon,
  Type as TypeIcon,
  ExternalLink
} from 'lucide-react';

/**
 * TYPES
 */
type FrameType = 'none' | 'bubble' | 'ticket' | 'focus' | 'minimal' | 'bold' | 'courier' | 'parcel' | 'wave' | 'flowers' | 'forest';
type DotStyle = 'square' | 'rounded' | 'dots';
type TextAlign = 'left' | 'center' | 'right';
type ExportFormat = 'png' | 'jpeg';

interface AppState {
  inputValue: string;
  label: string;
  frameType: FrameType;
  fontSize: number;
  fgColor: string;
  fgColor2: string; 
  bgColor: string;   
  dotStyle: DotStyle;
  useGradient: boolean;
  textAlign: TextAlign;
  logo: string | null;
  showLogo: boolean;
  exportFormat: ExportFormat;
  exportScale: number;
}

type AppAction = 
  | { type: 'SET_FIELD', field: keyof AppState, value: any }
  | { type: 'RESET' };

/**
 * INITIAL STATE
 */
const initialState: AppState = {
  inputValue: 'https://google.com',
  label: 'SCAN TO OPEN',
  frameType: 'none',
  fontSize: 10,
  fgColor: '#166534',
  fgColor2: '#22c55e',
  bgColor: '#ffffff',
  dotStyle: 'rounded',
  useGradient: true,
  textAlign: 'center',
  logo: null,
  showLogo: true,
  exportFormat: 'png',
  exportScale: 2,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

/**
 * HELPER: Validate if string is URL
 */
const isUrl = (str: string) => {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

/**
 * COMPONENTS
 */

const QRBase: React.FC<{ 
  value: string; 
  size?: number; 
  fgColor?: string; 
  fgColor2?: string;
  dotStyle?: DotStyle; 
  gradient?: boolean;
  logo?: string | null;
  showLogo?: boolean;
}> = ({ value, size = 180, fgColor = "#000000", fgColor2 = "#4f46e5", dotStyle = 'rounded', gradient = false, logo, showLogo }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);
  const [isLibraryReady, setIsLibraryReady] = useState(!!(window as any).QRCodeStyling);

  useEffect(() => {
    const checkLib = setInterval(() => {
      if ((window as any).QRCodeStyling) {
        setIsLibraryReady(true);
        clearInterval(checkLib);
      }
    }, 100);
    return () => clearInterval(checkLib);
  }, []);

  useEffect(() => {
    const QRCodeStyling = (window as any).QRCodeStyling;
    if (!QRCodeStyling || !containerRef.current) return;

    const options = {
      width: size,
      height: size,
      type: "svg",
      data: value || " ",
      image: (showLogo && logo) ? logo : undefined,
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
        imageSize: 0.4
      },
      dotsOptions: {
        color: fgColor,
        type: dotStyle === 'rounded' ? "rounded" : (dotStyle === 'dots' ? "dots" : "square"),
        gradient: gradient ? {
          type: "linear",
          rotation: 45,
          colorStops: [
            { offset: 0, color: fgColor },
            { offset: 1, color: fgColor2 }
          ]
        } : undefined
      },
      backgroundOptions: { color: "transparent" },
      cornersSquareOptions: {
        type: dotStyle === 'rounded' ? "extra-rounded" : "square",
        color: fgColor
      },
      cornersDotOptions: {
        type: dotStyle === 'rounded' ? "dot" : "square",
        color: fgColor
      }
    };

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling(options);
      containerRef.current.innerHTML = "";
      qrCodeInstance.current.append(containerRef.current);
    } else {
      qrCodeInstance.current.update(options);
    }
  }, [value, size, fgColor, fgColor2, dotStyle, gradient, logo, showLogo, isLibraryReady]);

  return (
    <div className="relative inline-block">
      <div ref={containerRef} />
      {!isLibraryReady && (
        <div 
          className="flex items-center justify-center border bg-slate-50 border-slate-200 rounded-xl"
          style={{ width: size, height: size }}
        >
          <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke={fgColor} strokeWidth="1.5" className="opacity-20">
            <rect x="2" y="2" width="8" height="8" rx="1"/>
            <rect x="14" y="2" width="8" height="8" rx="1"/>
            <rect x="2" y="14" width="8" height="8" rx="1"/>
            <path d="M14 14h2v2h-2v-2zM18 18h2v2h-2v-2zM14 18h2v2h-2v-2zM18 14h2v2h-2v-2zM21 14h1v1h-1v-1zM21 21h1v1h-1v-1z"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCcw className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * INDIVIDUAL FRAME COMPONENTS (Separated Logic)
 */

const FrameLabel: React.FC<{ label: string; color: string; fontSize: number; textAlign: TextAlign }> = ({ label, color, fontSize, textAlign }) => (
  <span 
    style={{ color, fontSize: `${fontSize}px`, textAlign }} 
    className="block w-full font-black tracking-widest uppercase"
  >
    {label}
  </span>
);

const ForestFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="flex flex-col items-center shadow-xl transition-all duration-300 p-12 rounded-[2rem] relative overflow-hidden" style={{ backgroundColor: state.bgColor }}>
    <div className="absolute top-0 left-0 w-full pointer-events-none opacity-40">
      <svg viewBox="0 0 400 120" fill={state.fgColor}>
        <path d="M0 120 L40 40 L80 120 Z M60 120 L100 20 L140 120 Z M120 120 L160 50 L200 120 Z M180 120 L220 10 L260 120 Z M240 120 L280 40 L320 120 Z M300 120 L340 15 L380 120 Z M360 120 L400 50 L440 120 Z" />
      </svg>
    </div>
    <div className="relative z-10 p-2 border shadow-inner bg-white/40 backdrop-blur-md rounded-2xl border-white/50">
      {children}
    </div>
    <div className="z-10 w-full mt-8">
      <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
    </div>
    <div className="absolute bottom-[-10px] left-0 w-full opacity-30 pointer-events-none">
      <svg viewBox="0 0 400 100" fill={state.fgColor}>
         <path d="M0 100 Q 50 20, 100 100 T 200 100 T 300 100 T 400 100 L 400 100 L 0 100 Z" />
         <circle cx="50" cy="80" r="20" />
         <circle cx="150" cy="90" r="30" />
         <circle cx="280" cy="75" r="25" />
         <circle cx="360" cy="85" r="15" />
      </svg>
    </div>
  </div>
);

const WaveFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="flex flex-col items-center shadow-xl transition-all duration-300 rounded-[3rem] overflow-hidden relative p-8" style={{ backgroundColor: state.bgColor }}>
    <div className="absolute top-0 left-0 w-full pointer-events-none opacity-20">
       <svg viewBox="0 0 1440 320" fill={state.fgColor}>
          <path d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,154.7C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
       </svg>
    </div>
    <div className="relative z-10">{children}</div>
    <div className="z-10 w-full mt-6">
      <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
    </div>
    <div className="absolute bottom-0 left-0 w-full rotate-180 pointer-events-none opacity-20">
       <svg viewBox="0 0 1440 320" fill={state.fgColor}>
          <path d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,154.7C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
       </svg>
    </div>
  </div>
);

const FlowersFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="flex flex-col items-center p-10 transition-all duration-300 border-2 rounded-full shadow-xl" style={{ borderColor: `${state.fgColor}20`, backgroundColor: state.bgColor }}>
    <div className="relative">
      {children}
      {[ "top-[-20px] left-[-20px]", "top-[-20px] right-[-20px]", "bottom-[-20px] left-[-20px]", "bottom-[-20px] right-[-20px]" ].map((pos, i) => (
        <div key={i} className={`absolute ${pos}`} style={{ color: state.fgColor }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2L10.5,8.5L4,7L8.5,12L4,17L10.5,15.5L12,22L13.5,15.5L20,17L15.5,12L20,7L13.5,8.5L12,2Z" />
          </svg>
        </div>
      ))}
    </div>
    <div className="mt-8">
      <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
    </div>
  </div>
);

const CourierFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="flex flex-col items-center shadow-xl transition-all duration-300 p-6 rounded-3xl border-t-[12px]" style={{ borderTopColor: state.fgColor, backgroundColor: state.bgColor }}>
      <div className="flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-black/5">
          <Utensils size={12} style={{ color: state.fgColor }} />
          <span className="text-[8px] font-bold opacity-70 uppercase tracking-tighter">Instant Delivery</span>
      </div>
      {children}
      <div className="w-full mt-4">
        <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
      </div>
  </div>
);

const ParcelFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="flex flex-col bg-white p-6 rounded-lg shadow-2xl border-l-[12px]" style={{ borderLeftColor: state.fgColor, backgroundColor: state.bgColor }}>
      <div className="flex items-start justify-between mb-4">
          <Truck size={24} style={{ color: state.fgColor }} />
          <div className="flex flex-col items-end opacity-50">
              <span className="text-[7px] font-black uppercase">Tracking ID</span>
              <span className="text-[9px] font-mono font-bold">#QR-LGS</span>
          </div>
      </div>
      <div className="p-2 border-2 border-dashed rounded-md border-black/5">{children}</div>
      <div className="pt-4 mt-4 border-t border-black/5">
        <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
      </div>
  </div>
);

const BubbleFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="flex flex-col items-center gap-8 p-6">
    <div className="relative p-4 rounded-[2rem] border-4 shadow-xl" style={{ borderColor: state.fgColor, backgroundColor: state.bgColor }}>
      {children}
      <div className="absolute w-8 h-8 rotate-45 -translate-x-1/2 border-b-4 border-r-4 -bottom-4 left-1/2" style={{ borderColor: state.fgColor, backgroundColor: state.bgColor }} />
    </div>
    <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
  </div>
);

const TicketFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="relative p-6 overflow-hidden border-t-8 shadow-2xl" style={{ borderTopColor: state.fgColor, backgroundColor: state.bgColor }}>
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full px-2 pb-2 mb-2 border-b border-dashed border-black/10 opacity-20"><Ticket size={12}/><Ticket size={12}/></div>
      {children}
      <div className="w-full pt-4 mt-2 border-t border-dashed border-black/10">
        <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
      </div>
    </div>
    {[-12, 'calc(100% - 12px)'].map((pos, i) => (
      <div key={i} className="absolute top-1/2 w-6 h-6 bg-[#f1f5f9] rounded-full -translate-y-1/2 border border-black/5" style={{ left: pos }} />
    ))}
  </div>
);

const FocusFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="relative p-10">
    {[
      'top-0 left-0 border-t-8 border-l-8', 
      'top-0 right-0 border-t-8 border-r-8', 
      'bottom-0 left-0 border-b-8 border-l-8', 
      'bottom-0 right-0 border-b-8 border-r-8'
    ].map((s, i) => (
      <div key={i} className={`absolute w-10 h-10 ${s}`} style={{ borderColor: state.fgColor }} />
    ))}
    <div className="p-2 rounded-xl" style={{ backgroundColor: state.bgColor }}>{children}</div>
    <div className="absolute left-0 right-0 -bottom-8">
      <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
    </div>
  </div>
);

const MinimalFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="flex flex-col items-center p-4 transition-all duration-300 border shadow-xl rounded-3xl" style={{ borderColor: `${state.fgColor}40`, backgroundColor: state.bgColor }}>
    {children}
    <div className="h-0.5 w-8 my-4" style={{ backgroundColor: state.fgColor }} />
    <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
  </div>
);

const DefaultFrame: React.FC<{ children: React.ReactNode; state: AppState }> = ({ children, state }) => (
  <div className="flex flex-col items-center shadow-xl transition-all duration-300 p-6 border-8 rounded-[2.5rem]" style={{ borderColor: state.fgColor, backgroundColor: state.bgColor }}>
    {children}
    <div className="mt-4">
      <FrameLabel label={state.label} color={state.fgColor} fontSize={state.fontSize} textAlign={state.textAlign} />
    </div>
  </div>
);

/**
 * MAIN DYNAMIC FRAME WRAPPER
 */
const DynamicFrame: React.FC<{ state: AppState; children: React.ReactNode }> = ({ children, state }) => {
  switch (state.frameType) {
    case 'none':
      return <div className="p-4 border shadow-sm rounded-xl border-slate-100" style={{ backgroundColor: state.bgColor }}>{children}</div>;
    case 'forest':
      return <ForestFrame state={state}>{children}</ForestFrame>;
    case 'wave':
      return <WaveFrame state={state}>{children}</WaveFrame>;
    case 'flowers':
      return <FlowersFrame state={state}>{children}</FlowersFrame>;
    case 'courier':
      return <CourierFrame state={state}>{children}</CourierFrame>;
    case 'parcel':
      return <ParcelFrame state={state}>{children}</ParcelFrame>;
    case 'bubble':
      return <BubbleFrame state={state}>{children}</BubbleFrame>;
    case 'ticket':
      return <TicketFrame state={state}>{children}</TicketFrame>;
    case 'focus':
      return <FocusFrame state={state}>{children}</FocusFrame>;
    case 'minimal':
      return <MinimalFrame state={state}>{children}</MinimalFrame>;
    default:
      return <DefaultFrame state={state}>{children}</DefaultFrame>;
  }
};

export default function FileBaseQRDemo() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const setField = (field: keyof AppState, value: any) => dispatch({ type: 'SET_FIELD', field, value });

  /**
   * SCAN REDIRECT LOGIC:
   * If the user enters a valid URL (http/https), the QR points directly to it.
   * If the user enters plain text, the QR points strictly to www.example.com.
   */
  const { finalQrTarget, inputIsUrl } = useMemo(() => {
    const trimmedInput = state.inputValue.trim();
    if (!trimmedInput) return { finalQrTarget: "https://www.example.com", inputIsUrl: false };
    
    const validUrl = isUrl(trimmedInput);
    return {
      finalQrTarget: validUrl ? trimmedInput : "https://www.example.com",
      inputIsUrl: validUrl
    };
  }, [state.inputValue]);

  useEffect(() => {
    const loadScripts = () => {
      if (document.getElementById('qr-styling-script')) return;
      const qrScript = document.createElement('script');
      qrScript.id = 'qr-styling-script';
      qrScript.src = "https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js";
      qrScript.async = true;
      const imgScript = document.createElement('script');
      imgScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js";
      imgScript.async = true;
      qrScript.onload = () => setLibsLoaded(true);
      document.head.appendChild(qrScript);
      document.head.appendChild(imgScript);
    };
    loadScripts();
    const checkInterval = setInterval(() => {
      if ((window as any).QRCodeStyling) { setLibsLoaded(true); clearInterval(checkInterval); }
    }, 500);
    return () => clearInterval(checkInterval);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setField('logo', reader.result as string);
        setField('showLogo', true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!qrRef.current || !(window as any).htmlToImage) return;
    
    const options = { 
      quality: 1, 
      backgroundColor: 'transparent', 
      pixelRatio: state.exportScale 
    };

    let dataUrl = '';
    try {
      if (state.exportFormat === 'png') {
        dataUrl = await (window as any).htmlToImage.toPng(qrRef.current, options);
      } else {
        dataUrl = await (window as any).htmlToImage.toJpeg(qrRef.current, { ...options, backgroundColor: state.bgColor });
      }

      const link = document.createElement('a');
      link.download = `pro-qr-${Date.now()}.${state.exportFormat}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans text-slate-900">
      <aside className="z-20 flex flex-col w-full max-h-screen gap-6 p-6 overflow-y-auto bg-white border-r shadow-2xl lg:w-96 border-slate-200 lg:shadow-none">
        <header>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-8 h-8 text-white bg-indigo-600 rounded-lg shadow-lg">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-xl italic font-black uppercase">QR-PRO</h1>
          </div>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Premium Customization Suite</p>
        </header>

        <div className="space-y-5">
          {/* Target Content */}
          <div className="space-y-3">
            <label className="block">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Input Content</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${inputIsUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                   {inputIsUrl ? <LinkIcon size={10} /> : <TypeIcon size={10} />}
                   <span className="text-[8px] font-black uppercase">{inputIsUrl ? 'Link' : 'Text'}</span>
                </div>
              </div>
              <textarea 
                rows={2}
                className="w-full px-4 py-3 text-sm font-medium transition-colors border-2 outline-none resize-none bg-slate-50 border-slate-100 rounded-xl focus:border-indigo-500" 
                placeholder="Enter URL or any text..."
                value={state.inputValue} 
                onChange={(e) => setField('inputValue', e.target.value)} 
              />
              <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                 <ExternalLink size={10} className="text-slate-400" />
                 <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                   Scanner Redirect: <span className={inputIsUrl ? "text-emerald-600" : "text-indigo-600"}>{finalQrTarget}</span>
                 </span>
              </div>
            </label>

            {/* CTA Settings */}
            <label className="block">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visual Label</span>
                <span className="text-indigo-600 text-[9px] font-bold">{state.fontSize}px</span>
              </div>
              <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 text-sm mb-3" value={state.label} onChange={(e) => setField('label', e.target.value)} />
              <input type="range" min="8" max="24" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" value={state.fontSize} onChange={(e) => setField('fontSize', parseInt(e.target.value))} />
            </label>

            <div className="flex items-center justify-between gap-2 p-1 border-2 bg-slate-50 border-slate-100 rounded-xl">
              {(['left', 'center', 'right'] as TextAlign[]).map(align => (
                <button key={align} onClick={() => setField('textAlign', align)} className={`flex-1 py-1.5 flex justify-center rounded-lg transition-all ${state.textAlign === align ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  {align === 'left' && <AlignLeft size={16} />}
                  {align === 'center' && <AlignCenter size={16} />}
                  {align === 'right' && <AlignRight size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Logo Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Logo Overlay</span>
              {state.logo && (
                <button onClick={() => setField('showLogo', !state.showLogo)} className={`flex items-center gap-1.5 text-[9px] font-black uppercase transition-colors ${state.showLogo ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {state.showLogo ? <Eye size={10} /> : <EyeOff size={10} />}
                  {state.showLogo ? 'Visible' : 'Hidden'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer group">
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl group-hover:border-indigo-400 transition-colors">
                  {state.logo ? (
                    <img src={state.logo} alt="Logo preview" className={`w-5 h-5 object-contain rounded-sm ${state.showLogo ? 'opacity-100' : 'opacity-25 grayscale'}`} />
                  ) : (
                    <ImageIcon size={14} className="text-slate-400" />
                  )}
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    {state.logo ? 'Change' : 'Upload'}
                  </span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
              {state.logo && (
                <button onClick={() => { setField('logo', null); setField('showLogo', false); }} className="p-2.5 bg-red-50 text-red-500 rounded-xl border-2 border-red-100 hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Templates Grid */}
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Templates & Frames</span>
            <div className="grid grid-cols-4 gap-2">
              {( [
                { id: 'none', icon: EyeOff }, { id: 'forest', icon: Trees }, { id: 'wave', icon: Wind }, { id: 'flowers', icon: Flower },
                { id: 'courier', icon: Utensils }, { id: 'parcel', icon: Truck }, { id: 'ticket', icon: Ticket }, { id: 'focus', icon: Maximize },
                { id: 'bubble', icon: MessageSquare }, { id: 'bold', icon: Square }, { id: 'minimal', icon: Circle }
              ] as const ).map(f => (
                <button key={f.id} onClick={() => setField('frameType', f.id)} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${state.frameType === f.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                  <f.icon className="w-3.5 h-3.5" />
                  <span className="text-[7px] font-black uppercase tracking-tighter leading-none mt-1">{f.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style & Colors */}
          <div className="pt-4 space-y-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Color Palette</span>
              <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" checked={state.useGradient} onChange={() => setField('useGradient', !state.useGradient)} className="w-3.5 h-3.5 rounded text-indigo-600" />
                 <span className="text-[9px] font-black uppercase text-slate-500">Gradient</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <input type="color" value={state.fgColor} onChange={(e) => setField('fgColor', e.target.value)} className="w-12 h-12 p-1 bg-white border-2 cursor-pointer rounded-xl border-slate-100" />
                <span className="text-[7px] font-black uppercase text-slate-400">Primary</span>
              </div>
              <div className={`flex flex-col items-center gap-1.5 transition-opacity ${state.useGradient ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <input type="color" value={state.fgColor2} onChange={(e) => setField('fgColor2', e.target.value)} className="w-12 h-12 p-1 bg-white border-2 cursor-pointer rounded-xl border-slate-100" />
                <span className="text-[7px] font-black uppercase text-slate-400">Secondary</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <input type="color" value={state.bgColor} onChange={(e) => setField('bgColor', e.target.value)} className="w-12 h-12 p-1 bg-white border-2 cursor-pointer rounded-xl border-slate-100" />
                <span className="text-[7px] font-black uppercase text-slate-400">Frame BG</span>
              </div>
            </div>
          </div>

          {/* EXPORT SETTINGS */}
          <div className="pt-4 space-y-4 border-t">
            <div className="flex items-center gap-2">
               <Settings2 size={12} className="text-slate-400" />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Export Settings</span>
            </div>
            
            <div className="p-3 space-y-3 border bg-slate-50 rounded-xl border-slate-100">
               <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-slate-500">Format</span>
                  <div className="flex gap-1 p-0.5 bg-slate-200 rounded-lg">
                    {['png', 'jpeg'].map((fmt) => (
                      <button 
                        key={fmt} 
                        onClick={() => setField('exportFormat', fmt)}
                        className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${state.exportFormat === fmt ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase text-slate-500">Output Scale</span>
                  <div className="flex gap-1 p-0.5 bg-slate-200 rounded-lg">
                    {[1, 2, 4].map((scale) => (
                      <button 
                        key={scale} 
                        onClick={() => setField('exportScale', scale)}
                        className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${state.exportScale === scale ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                      >
                        {scale}x
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        <button onClick={handleDownload} disabled={!libsLoaded} className="flex items-center justify-center w-full gap-3 py-4 mt-auto text-xs font-black tracking-widest text-white uppercase transition-all bg-indigo-600 shadow-xl rounded-2xl active:scale-95 disabled:opacity-50">
          <FileDown className="w-4 h-4" /> Export {state.exportFormat.toUpperCase()} ({state.exportScale}x)
        </button>
      </aside>

      <main className="flex-1 flex items-center justify-center p-8 relative bg-[#f1f5f9] overflow-hidden min-h-screen">
        <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at center, #6366f1 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
        <div className="z-10 flex flex-col items-center">
          <div ref={qrRef} className="p-8 transition-transform duration-500 scale-90 sm:scale-100">
            <DynamicFrame state={state}>
              <QRBase 
                value={finalQrTarget} 
                fgColor={state.fgColor} 
                fgColor2={state.fgColor2}
                size={180} 
                dotStyle={state.dotStyle} 
                gradient={state.useGradient} 
                logo={state.logo}
                showLogo={state.showLogo}
              />
            </DynamicFrame>
          </div>
          <div className="flex flex-col items-center gap-4 mt-12">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
              <div className={`w-1.5 h-1.5 rounded-full ${libsLoaded ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{libsLoaded ? 'Engine Ready' : 'Initializing Rendering Pipeline'}</span>
            </div>
            <div className="text-center duration-700 animate-in fade-in">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active QR Destination:</span>
              <p className={`text-[10px] font-mono truncate max-w-[200px] mt-0.5 ${inputIsUrl ? 'text-emerald-600 font-bold' : 'text-slate-600'}`}>
                {finalQrTarget}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}