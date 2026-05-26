import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCamera, FiCheckCircle, FiSearch, FiZap, FiX, FiAlertCircle } from 'react-icons/fi';
import { adminAPI } from '../../utils/api';

const SCAN_ACTIONS = [
  ['packed', 'Packed'],
  ['shipped', 'Shipped'],
  ['out_for_delivery', 'Out for delivery'],
  ['delivered', 'Delivered'],
];

/**
 * Barcode Scanner Component
 * Scans barcodes, QR codes, tracking IDs, AWB numbers
 * Updates order status in real-time
 * Supports both camera and manual input
 */
export default function BarcodeScanner({ onScanComplete }) {
  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const actionRef = useRef('packed');
  const [scanner, setScanner] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [action, setAction] = useState('packed');
  const [lastScan, setLastScan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [recentScans, setRecentScans] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [scanner]);

  /**
   * Process scanned barcode/QR code
   * Updates order status and records scan
   */
  const processCode = async (code) => {
    if (!code || processingRef.current) return;
    try {
      processingRef.current = true;
      setProcessing(true);
      const scanAction = actionRef.current;
      const { data } = await adminAPI.scanOrder({ code, action: scanAction });
      
      setLastScan(data.order);
      setManualCode('');
      setScanCount(prev => prev + 1);
      
      // Add to recent scans
      setRecentScans(prev => [
        { order: data.order, action: scanAction, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);

      // Play success sound
      playSuccessSound();
      
      toast.success(`✓ ${data.order.orderNumber} → ${scanAction.replace(/_/g, ' ')}`);
      onScanComplete?.(data.order);
    } catch (err) {
      playErrorSound();
      toast.error(err.response?.data?.message || 'Scan failed');
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  /**
   * Play success beep sound
   */
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio context not supported, skip
    }
  };

  /**
   * Play error beep sound
   */
  const playErrorSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 300;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      // Audio context not supported, skip
    }
  };

  /**
   * Start camera scanning
   */
  const startCamera = async () => {
    try {
      setCameraError(null);
      const { Html5Qrcode } = await import('html5-qrcode');
      const instance = new Html5Qrcode('admin-barcode-reader');
      await instance.start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: { width: 240, height: 160 } },
        (decodedText) => processCode(decodedText)
      );
      scannerRef.current = instance;
      setScanner(instance);
      setCameraActive(true);
      toast.success('Camera started - Ready to scan');
    } catch (err) {
      setCameraError('Camera not available. Using manual scan mode.');
      toast.error('Camera unavailable. Use manual entry.');
    }
  };

  /**
   * Stop camera scanning
   */
  const stopCamera = async () => {
    if (!scannerRef.current) return;
    await scannerRef.current.stop().catch(() => {});
    scannerRef.current = null;
    setScanner(null);
    setCameraActive(false);
    toast.success('Camera stopped');
  };

  /**
   * Clear scan history
   */
  const clearHistory = () => {
    setRecentScans([]);
    setScanCount(0);
    setLastScan(null);
  };

  return (
    <section style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(15,23,42,0.08)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div>
          <h2 style={{ color: '#111827', fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
            📱 Barcode Scanner
          </h2>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>
            Scan package, order, tracking codes, QR codes, or AWB numbers
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            background: cameraActive ? '#ECFDF5' : '#F9FAFB',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            color: cameraActive ? '#047857' : '#6B7280',
            border: '1px solid #E5E7EB',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: cameraActive ? '#10B981' : '#D1D5DB',
              animation: cameraActive ? 'pulse 2s infinite' : 'none'
            }} />
            {cameraActive ? 'Camera Active' : 'Standby'}
          </div>
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: cameraActive ? '#FEF2F2' : '#111827',
              color: cameraActive ? '#B91C1C' : 'white',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}
          >
            <FiCamera size={16} /> {cameraActive ? 'Stop' : 'Start Camera'}
          </button>
        </div>
      </div>

      {/* Camera Error Alert */}
      {cameraError && (
        <div style={{
          background: '#FEF2F2',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          border: '1px solid #FECACA',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#991B1B',
          fontSize: '13px'
        }}>
          <FiAlertCircle size={16} />
          {cameraError}
        </div>
      )}

      {/* Main Scanner Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 280px',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Camera Preview */}
        <div>
          <div
            id="admin-barcode-reader"
            style={{
              minHeight: '280px',
              borderRadius: '12px',
              border: '2px dashed #CBD5E1',
              background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {!cameraActive && (
              <div style={{ textAlign: 'center', color: '#64748B' }}>
                <FiZap size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>Scanner Ready</div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>Click "Start Camera" to begin</div>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && processCode(manualCode)}
              placeholder="Or paste barcode, QR, tracking ID..."
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 14px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={() => processCode(manualCode)}
              disabled={processing || !manualCode.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                background: '#C8102E',
                color: 'white',
                fontWeight: 800,
                cursor: processing || !manualCode.trim() ? 'not-allowed' : 'pointer',
                opacity: processing || !manualCode.trim() ? 0.6 : 1,
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              <FiSearch size={16} /> {processing ? 'Scanning...' : 'Scan'}
            </button>
          </div>
        </div>

        {/* Side Panel - Action Selection & Last Scan */}
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Scan Counter */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            border: '1px solid #E5E7EB'
          }}>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>SCANS TODAY</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#C8102E' }}>{scanCount}</p>
          </div>

          {/* Action Selection */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 800,
              color: '#6B7280',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              Scan Action
            </label>
            <div style={{ display: 'grid', gap: '6px' }}>
              {SCAN_ACTIONS.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setAction(value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: action === value ? '2px solid #C8102E' : '1px solid #E5E7EB',
                    background: action === value ? '#FEF2F2' : 'white',
                    color: action === value ? '#C8102E' : '#111827',
                    fontWeight: action === value ? 800 : 600,
                    fontSize: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Last Scan Result */}
          {lastScan && (
            <div style={{
              background: '#ECFDF5',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid #86EFAC',
              color: '#047857'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <FiCheckCircle size={16} />
                <span style={{ fontWeight: 800, fontSize: '13px' }}>Success!</span>
              </div>
              <p style={{
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '4px',
                wordBreak: 'break-word'
              }}>
                Order: {lastScan.orderNumber}
              </p>
              <p style={{ fontSize: '11px', opacity: 0.8 }}>
                Status: {lastScan.status?.replace(/_/g, ' ')}
              </p>
            </div>
          )}

          {/* Clear History Button */}
          {recentScans.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                background: 'white',
                color: '#6B7280',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* Recent Scans History */}
      {recentScans.length > 0 && (
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #E5E7EB'
        }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: 'white',
              color: '#111827',
              fontWeight: 700,
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>📋 Recent Scans ({recentScans.length})</span>
            <span style={{ fontSize: '16px' }}>{showHistory ? '▼' : '▶'}</span>
          </button>

          {showHistory && (
            <div style={{ marginTop: '12px', display: 'grid', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {recentScans.map((scan, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
                      {scan.order.orderNumber}
                    </p>
                    <p style={{ color: '#6B7280', fontSize: '11px' }}>
                      {scan.action.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <p style={{
                    color: '#9CA3AF',
                    fontSize: '11px',
                    whiteSpace: 'nowrap'
                  }}>
                    {scan.timestamp.toLocaleTimeString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
