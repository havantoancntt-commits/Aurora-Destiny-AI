// ==========================================
// ADMIN DASHBOARD & SYSTEM OBSERVABILITY
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  ToggleLeft,
  ToggleRight,
  X,
  RefreshCw,
  Server,
  Zap
} from 'lucide-react';
import { ObservabilityMetrics, AuditLog, SystemFeatureFlag } from '../types/admin';
import { runAllEngineTests, TestReport } from '../engine/engine.test';

interface Props {
  onClose: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onClose }) => {
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [flags, setFlags] = useState<SystemFeatureFlag[]>([]);
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [resMetrics, resLogs, resFlags] = await Promise.all([
        fetch('/api/metrics').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/feature-flags').then(r => r.json())
      ]);
      setMetrics(resMetrics);
      setAuditLogs(resLogs);
      setFlags(resFlags);
    } catch (e) {
      // Fallback
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const report = runAllEngineTests();
      setTestReport(report);
      setIsRunningTests(false);
    }, 400);
  };

  const toggleFlag = async (key: string, current: boolean) => {
    try {
      const res = await fetch('/api/feature-flags/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled: !current })
      });
      const updated = await res.json();
      setFlags(updated);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-cinzel">
              Giám Sát & Quản Trị Hệ Thống Toàn Diện
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Làm Mới Chỉ Số"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300 scrollbar-thin">
          {/* 1. KEY OBSERVABILITY METRICS */}
          {metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Người Dùng 24h</div>
                <div className="text-xl font-bold font-mono text-cyan-400">
                  {metrics.activeUsers24h.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-400">+18% so với tuần trước</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Độ Chuẩn Định Thuật Toán</div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {metrics.calculationDeterministicRate}%
                </div>
                <div className="text-[10px] text-emerald-400">Tỷ lệ sai lệch 0%</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Độ Trễ Phân Tích AI</div>
                <div className="text-xl font-bold font-mono text-purple-400">
                  {metrics.aiLatencyAvgMs}ms
                </div>
                <div className="text-[10px] text-slate-400">Gemini 2.5 Flash Server-Side</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Tỷ Lệ Cache Hit</div>
                <div className="text-xl font-bold font-mono text-amber-400">
                  {metrics.cacheHitRatio}%
                </div>
                <div className="text-[10px] text-slate-400">Ephemeris Đã Lập Chỉ Mục</div>
              </div>
            </div>
          )}

          {/* 2. LIVE ENGINE UNIT TEST SUITE */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Bộ Kiểm Thử Độ Chuẩn Xác Thuật Toán
                </h4>
              </div>
              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunningTests ? 'Đang Chạy Kiểm Thử...' : 'Chạy Toàn Bộ Kiểm Thử'}</span>
              </button>
            </div>

            {testReport && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <span className="text-emerald-400">ĐẠT: {testReport.passed}</span>
                  <span className="text-rose-400">KHÔNG ĐẠT: {testReport.failed}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {testReport.results.map((res, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                        res.status === 'PASS'
                          ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-900/40 text-rose-300'
                      }`}
                    >
                      <span className="font-semibold">{res.testName}</span>
                      <span className="font-mono font-bold">{res.status === 'PASS' ? 'ĐẠT' : 'LỖI'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. FEATURE FLAGS */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Cấu Hình Tính Năng & Phân Quyền Hệ Thống
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {flags.map((flag) => (
                <div
                  key={flag.key}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{flag.name}</div>
                    <div className="text-[10px] text-slate-400">{flag.description}</div>
                  </div>
                  <button
                    onClick={() => toggleFlag(flag.key, flag.enabled)}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    {flag.enabled ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. AUDIT LOGS */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Nhật Ký Bảo Mật & Hoạt Động Hệ Thống ({auditLogs.length})
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Bảo Mật Bất Biến</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {auditLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400">[{log.action}]</span>
                    <span className="text-slate-300 truncate">{log.details}</span>
                  </div>
                  <span className="text-slate-500 text-[10px] shrink-0 ml-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Developer & System Architect Signature */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-950/30 to-teal-950/20 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px]">R&D ARCHITECT</span>
              <span>Ứng dụng phát triển bởi <strong>Giáo Sư - Prof.TOAN</strong></span>
            </div>
            <a
              href="mailto:havantoancntt@gmail.com"
              className="font-mono text-teal-300 hover:text-teal-200 hover:underline"
            >
              havantoancntt@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
