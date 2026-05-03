'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import {
    Bell, Calendar, CheckCircle2, FileText, Activity,
    Star, ShieldCheck, X, BookOpen, AlertCircle, Siren, UserPlus, RefreshCw
} from 'lucide-react';

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
};

const ICON_MAP: Record<string, any> = {
    booking_new: Calendar,
    booking_cancelled: AlertCircle,
    session_completed: CheckCircle2,
    case_created: FileText,
    note_added: BookOpen,
    milestone_added: Activity,
    milestone_completed: CheckCircle2,
    plan_updated: FileText,
    review_received: Star,
    verification_approved: ShieldCheck,
    verification_rejected: AlertCircle,
    // New Types
    emergency_request_received: Siren,
    emergency_request_accepted: CheckCircle2,
    emergency_request_cascade: Siren,
    emergency_no_match: AlertCircle,
    followup_scheduled: Calendar,
    client_invite_sent: UserPlus,
    client_invite_accepted: UserPlus,
    client_invite_expired: AlertCircle,
    pending_slot_released: RefreshCw,
    recurring_series_created: RefreshCw,
    emergency_mode_toggled: Siren,
};

const COLOR_MAP: Record<string, string> = {
    booking_new: 'text-primary',
    booking_cancelled: 'text-error',
    session_completed: 'text-success',
    case_created: 'text-primary',
    note_added: 'text-primary',
    milestone_added: 'text-warning',
    milestone_completed: 'text-success',
    plan_updated: 'text-primary',
    review_received: 'text-warning',
    verification_approved: 'text-success',
    verification_rejected: 'text-error',
    // New Types
    emergency_request_received: 'text-error animate-pulse',
    emergency_request_accepted: 'text-success',
    emergency_request_cascade: 'text-error',
    emergency_no_match: 'text-text-muted',
    followup_scheduled: 'text-primary',
    client_invite_sent: 'text-primary',
    client_invite_accepted: 'text-success',
    client_invite_expired: 'text-text-muted',
    pending_slot_released: 'text-text-muted',
    recurring_series_created: 'text-primary',
    emergency_mode_toggled: 'text-warning',
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Fetch notifications on mount
    useEffect(() => {
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
            }
        };

        fetchNotifications();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;
        
        await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const getTimeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return format(date, 'MMM dd');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-white hover:bg-surface transition-colors"
                aria-label="Notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50 shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-[380px] max-h-[520px] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                        <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-text-muted hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto max-h-[440px] divide-y divide-border/30">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell size={28} className="mx-auto text-text-muted mb-3 opacity-50" />
                                <p className="text-sm text-text-muted">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const Icon = ICON_MAP[n.type] || Bell;
                                const color = COLOR_MAP[n.type] || 'text-text-muted';
                                
                                const content = (
                                    <div
                                        key={n.id}
                                        className={`flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer group ${
                                            n.is_read
                                                ? 'bg-transparent hover:bg-background/50'
                                                : 'bg-primary/5 hover:bg-primary/10'
                                        }`}
                                        onClick={() => {
                                            if (!n.is_read) markAsRead(n.id);
                                            if (n.link) setIsOpen(false);
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                            n.is_read ? 'bg-surface' : 'bg-primary/10'
                                        }`}>
                                            <Icon size={16} className={n.is_read ? 'text-text-muted' : color} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-sm font-semibold leading-tight ${
                                                    n.is_read ? 'text-text-secondary' : 'text-white'
                                                }`}>
                                                    {n.title}
                                                </h4>
                                                {!n.is_read && (
                                                    <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${
                                                n.is_read ? 'text-text-muted' : 'text-text-secondary'
                                            }`}>
                                                {n.message}
                                            </p>
                                            <span className="text-[10px] text-text-muted mt-1 block font-medium">
                                                {getTimeAgo(n.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                );

                                return n.link ? (
                                    <Link key={n.id} href={n.link}>
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={n.id}>{content}</div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
