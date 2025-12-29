import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Palette, 
  Image as ImageIcon,
  Sparkles,
  Layers,
  ImagePlus,
  Frame,
  Type as TypeIcon,
  Eye,
  EyeOff
} from 'lucide-react';

// --- Types & Interfaces ---

interface Template {
  id: string;
  name: string;
  fg: string;
  bg: string;
  dots: string;
  corners: string;
  icon: string;
}

type LabelSide = 'top' | 'bottom' | 'left' | 'right';

const TEMPLATES: Template[] = [
  {
    id: 'aurora-borealis',
    name: 'Aurora',
    fg: '#ffffff',
    bg: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #00c6ff 100%)',
    dots: 'classy',
    corners: 'extra-rounded',
    icon: '✨'
  },
  {
    id: 'midnight-rose',
    name: 'Midnight Rose',
    fg: '#ffd1d1',
    bg: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    dots: 'rounded',
    corners: 'dot',
    icon: '🥀'
  },
  {
    id: 'lavender-haze',
    name: 'Lavender Haze',
    fg: '#ffffff',
    bg: 'linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)',
    dots: 'dots',
    corners: 'extra-rounded',
    icon: '🔮'
  },
  {
    id: 'emerald-city',
    name: 'Emerald City',
    fg: '#d1fae5',
    bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    dots: 'classy-rounded',
    corners: 'square',
    icon: '💎'
  }
];

const DEFAULT_SCAN_URL = "https://example.com";

export default function CustomizeLabelPosition() {
  const [text, setText] = useState<string>('https://google.com');
  const [fgColor, setFgColor] = useState<string>('#ffffff');
  const [bgColor, setBgColor] = useState<string>('linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [dotType, setDotType] = useState<string>('classy');
  const [cornerType, setCornerType] = useState<string>('extra-rounded');
  const [cornerDotType, setCornerDotType] = useState<string>('dot');
  
  // Label State
  const [labelEnabled, setLabelEnabled] = useState<boolean>(true);
  const [labelText, setLabelText] = useState<string>('SCAN ME');
  const [labelSize, setLabelSize] = useState<number>(60);
  const [labelOffset, setLabelOffset] = useState<number>(40);
  const [labelColor, setLabelColor] = useState<string>('#2563eb'); 
  const [inheritColor, setInheritColor] = useState<boolean>(false);
  const [labelSide, setLabelSide] = useState<LabelSide>('bottom'); 

  const [frameEnabled, setFrameEnabled] = useState<boolean>(true);
  const [frameType, setFrameType] = useState<'rounded' | 'wave'>('wave'); 
  const [frameStroke, setFrameStroke] = useState<number>(16);
  const [framePadding, setFramePadding] = useState<number>(80);
  
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(0.2);
  const canvasRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);

  const activeLabelColor = inheritColor ? fgColor : labelColor;

  const isUrlFormat = (val: string): boolean => {
    return /^((https?:\/\/)|(www\.))?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(val.trim());
  };

  const processInputForQR = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed || !isUrlFormat(trimmed)) return DEFAULT_SCAN_URL;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const applyTemplate = (tpl: Template): void => {
    setBgImage(null); 
    setFgColor(tpl.fg);
    setBgColor(tpl.bg);
    setDotType(tpl.dots);
    setCornerType(tpl.corners);
    if (inheritColor) setLabelColor(tpl.fg);
  };

  const getBackgroundOptions = (bg: string, img: string | null) => {
    if (img) return { color: "transparent" };
    if (bg.includes('linear-gradient')) {
      const colors = bg.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g);
      if (colors && colors.length >= 2) {
        return {
          gradient: {
            type: "linear",
            rotation: 45,
            colorStops: colors.map((c, i) => ({ offset: i / (colors.length - 1), color: c }))
          }
        };
      }
    }
    return { color: bg };
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore - Window doesn't know about QRCodeStyling
      qrCodeInstance.current = new window.QRCodeStyling({
        width: 1000,
        height: 1000,
        type: "canvas",
        data: processInputForQR(text),
        image: logo,
        margin: frameEnabled ? framePadding : 10,
        dotsOptions: { color: fgColor, type: dotType },
        backgroundOptions: getBackgroundOptions(bgColor, bgImage),
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
          imageSize: logoSize,
          hideBackgroundDots: true
        },
        cornersSquareOptions: { color: fgColor, type: cornerType },
        cornersDotOptions: { color: fgColor, type: cornerDotType },
        qrOptions: { errorCorrectionLevel: "H", typeNumber: 0, mode: 'Byte' }
      });

      if (canvasRef.current) {
        canvasRef.current.innerHTML = "";
        qrCodeInstance.current.append(canvasRef.current);
      }
    };
    document.body.appendChild(script);
    return () => { if (script.parentNode) script.parentNode.removeChild(script); };
  }, []);

  useEffect(() => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.update({
        data: processInputForQR(text),
        image: logo,
        margin: frameEnabled ? framePadding : 10,
        dotsOptions: { color: fgColor, type: dotType },
        backgroundOptions: getBackgroundOptions(bgColor, bgImage),
        cornersSquareOptions: { type: cornerType, color: fgColor },
        cornersDotOptions: { type: cornerDotType, color: fgColor },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
          imageSize: logoSize,
          hideBackgroundDots: true
        }
      });
    }
  }, [text, fgColor, bgColor, dotType, cornerType, cornerDotType, logo, logoSize, bgImage, frameEnabled, framePadding]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setter(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawWaveOnCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, amp: number, freq: number, stroke: number): void => {
    ctx.beginPath();
    ctx.lineWidth = stroke;
    for (let i = 0; i <= w; i++) {
        ctx.lineTo(x + i, y + Math.sin(i * (freq * Math.PI / w)) * amp);
    }
    for (let i = 0; i <= h; i++) {
        ctx.lineTo(x + w + Math.sin(i * (freq * Math.PI / h)) * amp, y + i);
    }
    for (let i = w; i >= 0; i--) {
        ctx.lineTo(x + i, y + h + Math.sin(i * (freq * Math.PI / w)) * amp);
    }
    for (let i = h; i >= 0; i--) {
        ctx.lineTo(x + Math.sin(i * (freq * Math.PI / h)) * amp, y + i);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const handleDownload = async (): Promise<void> => {
    if (!qrCodeInstance.current || !canvasRef.current) return;

    const size = 1000;
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = size;
    finalCanvas.height = size;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Background
    if (bgImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bgImage;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      ctx.drawImage(img, 0, 0, size, size);
    } else {
      if (bgColor.includes('gradient')) {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        const colors = bgColor.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g) || ['#ffffff', '#eeeeee'];
        colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1), c));
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = bgColor || '#ffffff';
      }
      ctx.fillRect(0, 0, size, size);
    }

    // 2. Draw QR Content
    const rawQrCanvas = canvasRef.current.querySelector('canvas');
    if (rawQrCanvas) {
        ctx.drawImage(rawQrCanvas, 0, 0, size, size);
    }

    // 3. Draw Artistic Frame
    if (frameEnabled) {
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = frameStroke * 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      const x = 40; 
      const y = 40;
      const w = size - 80;
      const h = size - 80;

      if (frameType === 'rounded') {
        const radius = 80;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.stroke();
      } else {
        drawWaveOnCanvas(ctx, x, y, w, h, 20, 8, frameStroke * 2);
      }
    }

    // 4. Draw Label OUTSIDE (matching preview)
    if (labelEnabled && labelText.trim()) {
      ctx.save();
      ctx.fillStyle = activeLabelColor;
      ctx.font = `bold ${labelSize * 2.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const posFromEdge = (framePadding / 2 + labelOffset) * 2.5; 
      
      let xPos = size / 2;
      let yPos = size / 2;

      switch(labelSide) {
        case 'top':
          yPos = posFromEdge;
          ctx.fillText(labelText.toUpperCase(), xPos, yPos);
          break;
        case 'bottom':
          yPos = size - posFromEdge;
          ctx.fillText(labelText.toUpperCase(), xPos, yPos);
          break;
        case 'left':
          xPos = posFromEdge;
          ctx.translate(xPos, yPos);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(labelText.toUpperCase(), 0, 0);
          break;
        case 'right':
          xPos = size - posFromEdge;
          ctx.translate(xPos, yPos);
          ctx.rotate(Math.PI / 2);
          ctx.fillText(labelText.toUpperCase(), 0, 0);
          break;
      }
      ctx.restore();
    }

    // 5. Download
    const link = document.createElement('a');
    link.download = `qr-master-ts-${Date.now()}.png`;
    link.href = finalCanvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLabelPreviewStyles = () => {
    const base = "absolute z-30 pointer-events-none font-bold uppercase transition-all flex items-center justify-center";
    const pos = (framePadding / 2 + labelOffset) / 4;
    const fontSize = `${labelSize / 4}px`;
    
    switch(labelSide) {
      case 'top': return { style: { top: `${pos}px`, left: 0, right: 0, fontSize, color: activeLabelColor }, className: base };
      case 'bottom': return { style: { bottom: `${pos}px`, left: 0, right: 0, fontSize, color: activeLabelColor }, className: base };
      case 'left': return { style: { left: `${pos}px`, top: 0, bottom: 0, fontSize, color: activeLabelColor, transform: 'rotate(-90deg)' }, className: base };
      case 'right': return { style: { right: `${pos}px`, top: 0, bottom: 0, fontSize, color: activeLabelColor, transform: 'rotate(90deg)' }, className: base };
      default: return { style: {}, className: base };
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic tracking-tighter">QR TS Studio</h1>
              <p className="text-slate-500 text-sm font-medium">TypeScript + Outside Labels</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200/60">
              <label className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">
                <Layers size={16} /> Fast Templates
              </label>
              <div className="grid grid-cols-4 gap-3">
                {TEMPLATES.map((tpl) => (
                  <button key={tpl.id} onClick={() => applyTemplate(tpl)} className="flex flex-col items-center gap-2 group transition-all">
                    <div className="w-full aspect-square rounded-2xl shadow-md border-2 border-white group-hover:scale-105 transition-transform flex items-center justify-center text-lg" style={{ background: tpl.bg }}>
                        <span>{tpl.icon}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white p-7 rounded-[2.5rem] shadow-md border border-indigo-100/50">
                <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <TypeIcon size={16} className="text-indigo-600" /> Label Settings (Blue)
                    </label>
                    <button 
                        onClick={() => setLabelEnabled(!labelEnabled)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${labelEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}
                    >
                        {labelEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                        {labelEnabled ? 'Visible' : 'Hidden'}
                    </button>
                </div>
                
                <div className={`space-y-6 ${labelEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <div className="flex flex-col md:flex-row gap-4">
                        <input 
                            type="text" 
                            value={labelText} 
                            onChange={(e) => setLabelText(e.target.value)}
                            placeholder="Label text..."
                            className="flex-1 px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 uppercase"
                        />
                        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl">
                            {(['top', 'bottom', 'left', 'right'] as LabelSide[]).map((side) => (
                              <button 
                                key={side} 
                                onClick={() => setLabelSide(side)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${labelSide === side ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-400'}`}
                              >
                                <div className={`w-4 h-4 border-2 rounded-sm border-current relative`}>
                                   <div className={`absolute bg-current ${
                                     side === 'top' ? 'top-0 left-0 right-0 h-1' : 
                                     side === 'bottom' ? 'bottom-0 left-0 right-0 h-1' :
                                     side === 'left' ? 'left-0 top-0 bottom-0 w-1' :
                                     'right-0 top-0 bottom-0 w-1'
                                   }`} />
                                </div>
                              </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                         <div className="flex items-center gap-3">
                            <input 
                                type="color" 
                                value={activeLabelColor} 
                                onChange={(e) => {
                                    setLabelColor(e.target.value);
                                    setInheritColor(false);
                                }} 
                                className="w-10 h-10 rounded-xl cursor-pointer" 
                            />
                            <button 
                                onClick={() => setInheritColor(!inheritColor)}
                                className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${inheritColor ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}
                            >
                                {inheritColor ? 'Link to QR' : 'Custom Blue'}
                            </button>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                             <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                <span>Edge Offset (Outside Alignment)</span>
                                <span>{labelOffset}px</span>
                             </div>
                             <input 
                                type="range" min="-40" max="160" step="1" value={labelOffset} 
                                onChange={(e) => setLabelOffset(parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white p-7 rounded-[2.5rem] shadow-md border border-indigo-100/50">
                <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Frame size={16} className="text-indigo-600" /> Frame Shape
                    </label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {(['rounded', 'wave'] as const).map(type => (
                          <button 
                              key={type}
                              onClick={() => setFrameType(type)}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${frameType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                          >
                              {type}
                          </button>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span>Thickness</span>
                            <span>{frameStroke}px</span>
                        </div>
                        <input 
                            type="range" min="0" max="40" step="2" value={frameStroke} 
                            onChange={(e) => setFrameStroke(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span>QR Margin</span>
                            <span>{framePadding}px</span>
                        </div>
                        <input 
                            type="range" min="40" max="140" step="5" value={framePadding} 
                            onChange={(e) => setFramePadding(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white p-7 rounded-[2.5rem] shadow-md border border-slate-200/50">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        <ImagePlus size={16} className="text-indigo-500" /> Background
                    </label>
                    <label className="block w-full cursor-pointer relative h-24 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-white transition-all">
                         {bgImage ? <img src={bgImage} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-slate-300"><Upload size={16} /></div>}
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setBgImage)} />
                    </label>
                </section>
                <section className="bg-white p-7 rounded-[2.5rem] shadow-md border border-slate-200/50">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        <ImageIcon size={16} className="text-blue-500" /> Center Logo
                    </label>
                    <label className="block w-full cursor-pointer relative h-24 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-white transition-all">
                         {logo ? <img src={logo} className="w-full h-full object-contain p-2" /> : <div className="h-full flex items-center justify-center text-slate-300"><Upload size={16} /></div>}
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setLogo)} />
                    </label>
                </section>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-10 w-full">
              <div className="bg-white p-10 lg:p-14 rounded-[4rem] shadow-2xl shadow-indigo-900/10 border border-slate-200/50 flex flex-col items-center">
                <div 
                    className="relative p-4 bg-slate-100 rounded-[3.5rem] border border-slate-200 shadow-inner overflow-hidden aspect-square w-full max-w-[360px]"
                    style={{ padding: frameEnabled ? `${framePadding / 20}rem` : '1rem' }}
                >
                  {/* Frame Preview */}
                  {frameEnabled && frameType === 'wave' && (
                      <div className="absolute inset-0 z-20 pointer-events-none p-4">
                         <svg viewBox="0 0 400 400" className="w-full h-full">
                            <path 
                                d="M 60 60 Q 100 40 140 60 Q 180 80 220 60 Q 260 40 300 60 Q 340 80 340 120 Q 360 160 340 200 Q 320 240 340 280 Q 360 320 300 340 Q 260 360 220 340 Q 180 320 140 340 Q 100 360 60 340 Q 20 320 60 280 Q 80 240 60 200 Q 40 160 60 120 Q 80 80 60 60"
                                fill="none"
                                stroke={fgColor}
                                strokeWidth={frameStroke / 4}
                                strokeLinejoin="round"
                            />
                         </svg>
                      </div>
                  )}

                  {frameEnabled && frameType === 'rounded' && (
                      <div 
                        className="absolute inset-4 rounded-[2.5rem] z-20 pointer-events-none"
                        style={{ border: `${frameStroke / 5}px solid ${fgColor}` }}
                      />
                  )}

                  {/* Label Preview */}
                  {labelEnabled && labelText && (
                      <div style={getLabelPreviewStyles().style} className={getLabelPreviewStyles().className}>
                        {labelText}
                      </div>
                  )}

                  {bgImage && (
                    <div className="absolute inset-4 rounded-[2.5rem] overflow-hidden">
                      <img src={bgImage} alt="BG" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div ref={canvasRef} className="relative z-10 w-full h-full [&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:rounded-[2.5rem]" />
                </div>

                <div className="w-full space-y-4 mt-12">
                   <div className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                      <Palette size={18} className="text-indigo-600" />
                      <input 
                        type="text" 
                        value={text} 
                        onChange={(e) => setText(e.target.value)}
                        className="bg-transparent outline-none flex-1 font-bold text-slate-700"
                        placeholder="Scan URL..."
                      />
                   </div>

                    <button 
                      onClick={handleDownload} 
                      className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-6 rounded-3xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> 
                        DOWNLOAD (TS VERSION)
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}