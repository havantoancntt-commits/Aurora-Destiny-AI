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
  Zap,
  Lock,
  Fingerprint,
  Ban,
  Key
} from 'lucide-react';
import { ObservabilityMetrics, AuditLog, SystemFeatureFlag } from '../types/admin';
import { runAllEngineTests, TestReport } from '../engine/engine.test';
import { api } from '../services/apiClient';

interface Props {
  onClose: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onClose }) => {
  const [metrics, setMetrics] = useState<ObservabilityMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [flags, setFlags] = useState<SystemFeatureFlag[]>([]);
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [securityData, setSecurityData] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showCustomAuth, setShowCustomAuth] = useState(false);

  const fetchAdminData = async () => {
    try {
      setAuthError(null);
      const token = api.getToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [resMetrics, resLogs, resFlags, resSec] = await Promise.all([
        fetch('/api/metrics', { headers }).then(r => {
          if (r.status === 401 || r.status === 403) throw new Error('Cần quyền Quản trị viên (Admin/Super Admin)');
          return r.json();
        }),
        fetch('/api/audit-logs', { headers }).then(r => {
          if (r.status === 401 || r.status === 403) return [];
          return r.json();
        }),
        fetch('/api/feature-flags', { headers }).then(r => r.json()),
        fetch('/api/admin/security-threats', { headers }).then(r => {
          if (r.ok) return r.json();
          return null;
        }).catch(() => null)
      ]);
      setMetrics(resMetrics);
      setAuditLogs(Array.isArray(resLogs) ? resLogs : []);
      setFlags(Array.isArray(resFlags) ? resFlags : []);
      if (resSec) setSecurityData(resSec);
    } catch (e: any) {
      setAuthError(e?.message || 'Không có quyền truy cập');
      // Fetch feature flags even if not admin
      fetch('/api/feature-flags').then(r => r.json()).then(f => setFlags(Array.isArray(f) ? f : [])).catch(() => {});
    }
  };

  const handleAdminLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    try {
      setIsAuthenticating(true);
      setAuthError(null);
      const emailToUse = customEmail || adminEmailInput.trim();
      const passToUse = customPass || adminPasswordInput;
      await api.login(emailToUse, passToUse);
      await fetchAdminData();
    } catch (e: any) {
      setAuthError(e?.message || 'Đăng nhập quản trị viên thất bại');
    } finally {
      setIsAuthenticating(false);
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
      const updated = await api.toggleFeatureFlag(key, !current);
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
          {authError && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 space-y-3">
              <div className="flex items-start gap-2.5 text-amber-300">
                <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-200">Yêu cầu xác thực quyền Quản Trị Viên</div>
                  <div className="text-[11px] text-amber-400/90">{authError} — Vui lòng đăng nhập với tài khoản quản trị hệ thống đã cấu hình.</div>
                </div>
              </div>

              <form
                onSubmit={(e) => handleAdminLogin(e)}
                className="pt-2 border-t border-amber-800/40 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end"
              >
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Email Quản Trị</label>
                  <input
                    type="email"
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isAuthenticating || !adminEmailInput || !adminPasswordInput}
                    className="w-full py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer text-xs"
                  >
                    {isAuthenticating ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 1. KEY OBSERVABILITY METRICS */}
          {metrics && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Người Dùng 24h</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">
                    {(metrics.activeUsers24h ?? metrics.totalUsers ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    {metrics.totalActiveSessions !== undefined ? `${metrics.totalActiveSessions} phiên hoạt động` : 'Telemetry tích cực'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Độ Chuẩn Thuật Toán</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {metrics.calculationDeterministicRate !== undefined && metrics.calculationDeterministicRate !== null
                      ? `${metrics.calculationDeterministicRate}%`
                      : 'N/A (Chưa đo)'}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    {metrics.calcLatencyP95Ms !== undefined && metrics.calcLatencyP95Ms > 0 ? `p95: ${metrics.calcLatencyP95Ms}ms` : 'Chưa có mẫu đo'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Độ Trễ Phân Tích AI</div>
                  <div className="text-xl font-bold font-mono text-purple-400">
                    {metrics.aiLatencyAvgMs !== undefined && metrics.aiLatencyAvgMs !== null && metrics.aiLatencyAvgMs > 0 ? `${metrics.aiLatencyAvgMs}ms` : 'Chưa có dữ liệu'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {metrics.aiLatencyP50Ms !== undefined && metrics.aiLatencyP50Ms !== null && metrics.aiLatencyP50Ms > 0
                      ? `p50: ${metrics.aiLatencyP50Ms}ms | p95: ${metrics.aiLatencyP95Ms}ms`
                      : 'Gemini 2.5 Flash'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Độ Trễ Cơ Sở Dữ Liệu</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">
                    {metrics.dbLatencyMs !== undefined && metrics.dbLatencyMs !== null && metrics.dbLatencyMs > 0 ? `${metrics.dbLatencyMs}ms` : 'Chưa có dữ liệu'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {metrics.dbLatencyP95Ms !== undefined && metrics.dbLatencyP95Ms !== null && metrics.dbLatencyP95Ms > 0
                      ? `p50: ${metrics.dbLatencyP50Ms}ms | p95: ${metrics.dbLatencyP95Ms}ms`
                      : 'Postgres / File Engine'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-slate-400">Tỷ Lệ Cache Hit</div>
                  <div className="text-xl font-bold font-mono text-amber-400">
                    {metrics.cacheHitRatio !== undefined && metrics.cacheHitRatio !== null ? `${metrics.cacheHitRatio}%` : 'Chưa có dữ liệu'}
                  </div>
                  <div className="text-[10px] text-slate-400">Ephemeris Đã Lập Chỉ Mục</div>
                </div>
              </div>

              {/* Additional Durability & System Health Bar */}
              <div className="p-2.5 px-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-4">
                  <span>Hồ Sơ Lưu Trữ: <strong className="text-slate-200 font-mono">{(metrics.totalProfilesStored ?? metrics.totalProfiles ?? 0).toLocaleString()}</strong></span>
                  <span>Tổng Lá Số Đã Lập: <strong className="text-slate-200 font-mono">{(metrics.totalCalculations ?? 0).toLocaleString()}</strong></span>
                  <span>Nhật Ký Kiểm Toán: <strong className="text-slate-200 font-mono">{(metrics.totalAuditLogs ?? 0).toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">Hệ Thống Trực Tuyến</span>
                  {metrics.calculationEngineVersion && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-slate-300">
                      {metrics.calculationEngineVersion}
                    </span>
                  )}
                </div>
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

          {/* 3B. ENTERPRISE WAF & ALGORITHM INTELLECTUAL PROPERTY SHIELD */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Tường Lửa WAF & Hệ Thống Bảo Vệ Bản Quyền Thuật Toán
                </h4>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ARMORED PROVENANCE ACTIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Con Dấu Mật Mã Thuật Toán</span>
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="font-semibold text-slate-200">HMAC-SHA256 Canonical Seal</div>
                <div className="text-[10px] text-emerald-400">Bảo vệ tính toàn vẹn & xác thực nguồn gốc</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Bộ Phát Hiện Quét Tham Số</span>
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="font-semibold text-slate-200">Anti-Scraping Sweeper</div>
                <div className="text-[10px] text-amber-300">Chặn dò bảng sao & giải mã đảo ngược</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Cách Ly IP Tự Động (Auto-Ban)</span>
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="font-semibold text-slate-200">
                  {securityData?.activeQuarantinedIpsCount ?? 0} IP Đang Bị Cách Ly
                </div>
                <div className="text-[10px] text-slate-400">
                  {securityData?.totalThreatsDetected ?? 0} đợt tấn công đã vô hiệu hóa
                </div>
              </div>
            </div>

            {securityData?.quarantinedIps && securityData.quarantinedIps.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-1.5">
                <div className="text-[11px] font-semibold text-rose-300">Danh Sách IP Đang Bị Cách Ly Tự Động:</div>
                <div className="space-y-1 font-mono text-[10px]">
                  {securityData.quarantinedIps.map((ban: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-rose-400/90">
                      <span>Hash: {ban.ipHash} ({ban.reason})</span>
                      <span>Còn {ban.remainingSeconds}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
