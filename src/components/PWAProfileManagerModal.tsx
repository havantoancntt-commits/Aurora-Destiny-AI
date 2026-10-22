// ==========================================
// AURORA DESTINY AI — PWA DESTINY PROFILE VAULT & MANAGER
// Professional multi-profile management, offline-first storage,
// category tagging, pin/star, backup/restore JSON, and PWA health.
// ==========================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Plus,
  Pin,
  Tag,
  Download,
  Upload,
  Trash2,
  Check,
  HardDrive,
  Wifi,
  WifiOff,
  User,
  Users,
  Briefcase,
  Heart,
  Sparkles,
  FileText,
  Calendar,
  Compass,
  Clock,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { UserProfile } from '../types/user';
import { CalculationResult } from '../types/destiny';
import { pwaProfileStorage, PwaStorageStats } from '../services/pwaProfileStorage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { sacredSound } from '../services/soundService';
import { api } from '../services/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onOpenNewProfileModal: () => void;
  onProfilesUpdated: (updatedProfiles: UserProfile[]) => void;
}

type CategoryFilter = 'all' | 'self' | 'family' | 'partner' | 'friend' | 'client';

const CATEGORY_DEFINITIONS: Record<CategoryFilter, { label: string; icon: any; color: string }> = {
  all: { label: 'Tất Cả', icon: Users, color: 'text-slate-300' },
  self: { label: 'Bản Thân', icon: User, color: 'text-teal-400' },
  family: { label: 'Gia Đình', icon: Heart, color: 'text-rose-400' },
  partner: { label: 'Đối Tác / Việc', icon: Briefcase, color: 'text-amber-400' },
  friend: { label: 'Bạn Bè', icon: Sparkles, color: 'text-indigo-400' },
  client: { label: 'Khách Hàng', icon: Tag, color: 'text-purple-400' }
};

export const PWAProfileManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onOpenNewProfileModal,
  onProfilesUpdated
}) => {
  const isOnline = useOnlineStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editTag, setEditTag] = useState<string>('self');
  const [editNotes, setEditNotes] = useState<string>('');
  const [stats, setStats] = useState<PwaStorageStats | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load storage statistics
  const refreshStats = async () => {
    try {
      const s = await pwaProfileStorage.getStorageStats();
      setStats(s);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      refreshStats();
      setStatusMessage(null);
      setDeleteConfirmId(null);
      setEditingProfileId(null);
    }
  }, [isOpen, profiles]);

  // Filtered & Searched Profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const pTag = p.tag || (p.isPrimary ? 'self' : 'family');
        if (pTag !== selectedCategory) return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nameMatch = p.name.toLowerCase().includes(query);
        const birthYearMatch = p.birthData.solarYear.toString().includes(query);
        const notesMatch = p.notes?.toLowerCase().includes(query);
        const cityMatch = p.birthData.birthCity?.toLowerCase().includes(query);
        return nameMatch || birthYearMatch || !!notesMatch || !!cityMatch;
      }

      return true;
    });
  }, [profiles, selectedCategory, searchTerm]);

  // Handle Toggle Pin
  const handleTogglePin = async (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    try {
      sacredSound.playCelestialChime(864);
      const updated = await pwaProfileStorage.togglePinProfile(profileId);
      onProfilesUpdated(updated);
      refreshStats();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  // Open Edit Metadata Form
  const handleStartEdit = (e: React.MouseEvent, prof: UserProfile) => {
    e.stopPropagation();
    setEditingProfileId(prof.id);
    setEditTag(prof.tag || (prof.isPrimary ? 'self' : 'family'));
    setEditNotes(prof.notes || '');
  };

  // Save Edit Metadata
  const handleSaveEdit = async (profileId: string) => {
    try {
      sacredSound.playSacredSuccess();
      const updated = await pwaProfileStorage.updateProfileTag(profileId, editTag, editNotes);
      onProfilesUpdated(updated);
      setEditingProfileId(null);
      setStatusMessage({ type: 'success', text: 'Đã lưu ghi chú và phân loại hồ sơ an toàn!' });
      setTimeout(() => setStatusMessage(null), 3000);
      refreshStats();
    } catch (err) {
      console.error('Failed to update tag:', err);
      setStatusMessage({ type: 'error', text: 'Không thể cập nhật hồ sơ.' });
    }
  };

  // Handle Delete Profile Decisively (Xóa Dứt Điểm Máy Chủ & Thiết Bị)
  const handleDeleteProfile = async (profileId: string) => {
    try {
      setIsDeleting(true);
      sacredSound.playSacredTap(432);

      const deletedProf = profiles.find((p) => p.id === profileId);

      // 1. Decisive dual-tier removal: Server database + local IndexedDB/localStorage
      await api.deleteProfile(profileId);
      await pwaProfileStorage.deleteProfile(profileId);

      // 2. Immediate state updates across modal and parent app
      const updated = profiles.filter((p) => p.id !== profileId);
      onProfilesUpdated(updated);
      setDeleteConfirmId(null);
      setProfileToDelete(null);

      // 3. Smart profile switch if the active profile was deleted
      if (activeProfileId === profileId && updated.length > 0) {
        onSelectProfile(updated[0].id);
      }

      setStatusMessage({
        type: 'success',
        text: `Đã xóa dứt điểm lá số "${deletedProf?.name || 'hồ sơ'}" khỏi thiết bị và máy chủ thành công!`
      });
      setTimeout(() => setStatusMessage(null), 4000);
      refreshStats();
    } catch (err) {
      console.error('Failed to delete profile:', err);
      // Fallback offline deletion ensuring local state is always cleanly updated
      await pwaProfileStorage.deleteProfile(profileId).catch(() => {});
      const updated = profiles.filter((p) => p.id !== profileId);
      onProfilesUpdated(updated);
      setDeleteConfirmId(null);
      setProfileToDelete(null);
      if (activeProfileId === profileId && updated.length > 0) {
        onSelectProfile(updated[0].id);
      }
      setStatusMessage({ type: 'info', text: 'Đã xóa lá số khỏi bộ nhớ thiết bị ngoại tuyến.' });
      setTimeout(() => setStatusMessage(null), 3000);
      refreshStats();
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Full Backup
  const handleExportBackup = async () => {
    try {
      sacredSound.playCelestialChime(768);
      const jsonStr = await pwaProfileStorage.exportBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `aurora_destiny_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Đã xuất tệp sao lưu dữ liệu lá số thành công!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export backup:', err);
      setStatusMessage({ type: 'error', text: 'Không thể xuất tệp sao lưu.' });
    }
  };

  // Import Backup
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await pwaProfileStorage.importBackup(text);
      sacredSound.playSacredSuccess();
      onProfilesUpdated(res.profiles);
      setStatusMessage({
        type: 'success',
        text: `Nhập sao lưu thành công! Đã khôi phục/thêm mới ${res.importedCount} hồ sơ lá số.`
      });
      setTimeout(() => setStatusMessage(null), 5000);
      refreshStats();
    } catch (err: any) {
      console.error('Import backup failed:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Tệp sao lưu không đúng định dạng.' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#0f111e] via-[#090b14] to-[#06070c] border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden z-10 flex flex-col max-h-[92vh]"
      >
        {/* Top Accent Light Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-indigo-500 via-amber-500 to-purple-600" />

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white font-cinzel">
                  Kho Hồ Sơ Lá Số Ngoại Tuyến PWA
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-teal-500/15 border border-teal-400/40 text-teal-300">
                  {stats?.storageType === 'indexeddb' ? 'IndexedDB High-Cap' : 'LocalStorage Mirror'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Lưu trữ lá số đa tầng an toàn trên thiết bị của bạn. Khởi động tức thì, hoạt động trọn vẹn cả khi không có mạng.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* New Profile Quick Button */}
            <button
              onClick={() => {
                onClose();
                onOpenNewProfileModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Lập Lá Số Mới</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-b ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar: Search, Category Filter, and PWA Health Bar */}
        <div className="p-4 sm:p-5 bg-black/40 border-b border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo họ tên, năm sinh, nơi sinh, ghi chú..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/15 focus:border-teal-400 focus:outline-none text-xs text-white placeholder-slate-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* PWA Storage & Connectivity Quick Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 font-mono">
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-teal-300">Đã Kết Nối Server</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300">Ngoại Tuyến (Offline)</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 font-mono">
                <span className="text-slate-400">Đã Lưu:</span>
                <span className="text-white font-bold">{profiles.length}</span>
                <span className="text-slate-500">Lá Số</span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(Object.keys(CATEGORY_DEFINITIONS) as CategoryFilter[]).map((catKey) => {
              const def = CATEGORY_DEFINITIONS[catKey];
              const Icon = def.icon;
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40 shadow-sm'
                      : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.07] border border-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-300' : def.color}`} />
                  <span>{def.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredProfiles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Compass className="w-10 h-10 mx-auto text-slate-600 animate-spin-slow" />
              <p className="text-sm font-medium text-slate-300">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Không tìm thấy hồ sơ lá số nào phù hợp với bộ lọc.'
                  : 'Chưa có hồ sơ lá số nào được lưu.'}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenNewProfileModal();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-semibold hover:bg-teal-400 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nhập Thông Tin Lập Lá Số Đầu Tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredProfiles.map((prof) => {
                const isActive = prof.id === activeProfileId;
                const isPinned = !!prof.isPinned;
                const currentTag = prof.tag || (prof.isPrimary ? 'self' : 'family');
                const tagMeta = CATEGORY_DEFINITIONS[currentTag as CategoryFilter] || CATEGORY_DEFINITIONS.self;
                const isEditing = editingProfileId === prof.id;

                return (
                  <div
                    key={prof.id}
                    onClick={() => {
                      if (!isEditing) {
                        sacredSound.playSacredTap(528);
                        onSelectProfile(prof.id);
                        onClose();
                      }
                    }}
                    className={`relative group p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-teal-950/40 to-slate-900/80 border-teal-400/50 shadow-[0_0_20px_rgba(45,212,191,0.15)] ring-1 ring-teal-400/30'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Top Row: Avatar, Name, Pin, Active Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${
                            isActive
                              ? 'bg-teal-500 text-slate-950 ring-2 ring-teal-300/40'
                              : 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-teal-300 border border-white/15'
                          }`}
                        >
                          {prof.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-white text-sm">
                              {prof.name}
                            </span>
                            {prof.isPrimary && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                                Chính Chủ
                              </span>
                            )}
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-teal-400/20 text-teal-300 font-bold">
                                Đang Xem
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {prof.birthData.solarDay}/{prof.birthData.solarMonth}/{prof.birthData.solarYear}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {prof.birthData.solarHour}:{prof.birthData.solarMinute.toString().padStart(2, '0')}
                            </span>
                            {prof.birthData.birthCity && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[90px]">{prof.birthData.birthCity}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Top Action Icons */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleTogglePin(e, prof.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isPinned
                              ? 'text-amber-400 bg-amber-500/15'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                          }`}
                          title={isPinned ? 'Bỏ ghim lá số' : 'Ghim lá số lên đầu'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 rotate-45' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleStartEdit(e, prof)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                          title="Chỉnh sửa ghi chú & phân loại"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata / Tag & Notes Section */}
                    <div className="mt-3 pt-2.5 border-t border-white/[0.07] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.04] border border-white/10 ${tagMeta.color}`}>
                          <tagMeta.icon className="w-3 h-3" />
                          <span>{tagMeta.label}</span>
                        </span>

                        {prof.notes && !isEditing && (
                          <span className="text-[11px] text-slate-400 italic truncate max-w-[170px]" title={prof.notes}>
                            "{prof.notes}"
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <span>Giới tính: {prof.birthData.gender === 'Male' ? 'Nam' : 'Nữ'}</span>
                      </div>
                    </div>

                    {/* Inline Editing Form */}
                    {isEditing && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 p-3 rounded-xl bg-black/60 border border-teal-500/30 space-y-2 animate-in fade-in"
                      >
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-slate-400 uppercase font-mono">Phân loại:</label>
                          <select
                            value={editTag}
                            onChange={(e) => setEditTag(e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-white/20 text-xs text-white focus:outline-none focus:border-teal-400"
                          >
                            <option value="self">🌟 Bản Thân</option>
                            <option value="family">👨‍👩‍👧 Gia Đình</option>
                            <option value="partner">💼 Đối Tác / Việc</option>
                            <option value="friend">🤝 Bạn Bè</option>
                            <option value="client">👤 Khách Hàng</option>
                          </select>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Ghi chú riêng cho lá số này (ví dụ: Giờ sinh do mẹ nhớ...)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingProfileId(null)}
                            className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => handleSaveEdit(prof.id)}
                            className="px-3 py-1 rounded-lg bg-teal-500 text-slate-950 font-semibold text-xs hover:bg-teal-400 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Lưu Ghi Chú</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Strip */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setProfileToDelete(prof)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Xóa dứt điểm lá số khỏi thiết bị và máy chủ"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Xóa</span>
                      </button>

                      {!isActive && (
                        <button
                          onClick={() => {
                            sacredSound.playSacredTap(528);
                            onSelectProfile(prof.id);
                            onClose();
                          }}
                          className="text-[11px] text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <span>Mở Lá Số</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Backup & Restore Utilities */}
        <div className="p-4 sm:p-5 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Dung lượng ước lượng:</span>
            <span className="font-mono text-white font-medium">
              {stats ? `${(stats.estimatedBytes / 1024).toFixed(1)} KB` : 'Đang tính...'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Sẵn Sàng Ngoại Tuyến</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Hidden File Input for Import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFileChange}
              accept=".json,application/json"
              className="hidden"
            />

            {/* Import Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
              title="Khôi phục danh sách lá số từ tệp JSON đã lưu"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Nhập Sao Lưu (.json)</span>
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-teal-400/40 text-teal-200 hover:text-white transition-all cursor-pointer font-semibold shadow-sm"
              title="Tải về tệp sao lưu toàn bộ lá số để chuyển máy hoặc lưu trữ an toàn"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              <span>Xuất Sao Lưu Toàn Bộ</span>
            </button>
          </div>
        </div>

        {/* Dedicated Modal Dialog Cho Xóa Dứt Điểm Lá Số */}
        <AnimatePresence>
          {profileToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                className="relative w-full max-w-md bg-gradient-to-b from-[#1c1218] via-[#140c12] to-[#0d070b] border-2 border-rose-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(244,63,94,0.35)] text-slate-100 space-y-4"
              >
                {/* Top Warning Badge */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    <Trash2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Xác Nhận Xóa Dứt Điểm</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                      Xóa Lá Số: {profileToDelete.name}
                    </h3>
                  </div>
                </div>

                {/* Target Profile Metadata Card */}
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Đương số:</span>
                    <span className="font-bold text-white uppercase">{profileToDelete.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ngày sinh:</span>
                    <span className="font-mono text-amber-300">
                      {profileToDelete.birthData.solarDay}/{profileToDelete.birthData.solarMonth}/{profileToDelete.birthData.solarYear} ({profileToDelete.birthData.solarHour}:{profileToDelete.birthData.solarMinute.toString().padStart(2, '0')})
                    </span>
                  </div>
                  {profileToDelete.birthData.birthCity && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Nơi sinh:</span>
                      <span className="text-slate-200">{profileToDelete.birthData.birthCity}</span>
                    </div>
                  )}
                </div>

                {/* Reassuring Warning Text */}
                <p className="text-xs text-rose-200/90 leading-relaxed font-light">
                  ⚠️ Thao tác này sẽ <strong className="font-semibold text-white">xóa vĩnh viễn và dứt điểm</strong> hồ sơ này cùng toàn bộ kết quả luận giải Tử Vi 12 Cung, Tứ Trụ Bát Tự và lịch sử vận hạn khỏi bộ nhớ thiết bị ngoại tuyến và đồng bộ máy chủ. Không thể hoàn tác.
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setProfileToDelete(null)}
                    className="w-1/2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer text-center"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDeleteProfile(profileToDelete.id)}
                    className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${isDeleting ? 'animate-spin' : ''}`} />
                    <span>{isDeleting ? 'Đang Xóa...' : 'Xóa Dứt Điểm'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
