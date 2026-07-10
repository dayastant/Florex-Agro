import React, { useState } from 'react';
import api from '../../services/api';

interface Settings {
  minMoistureThreshold: number;
  maxTempThreshold: number;
  leakDetection: boolean;
  mqttBroker: string;
  alertEmails: string;
}

interface SettingsTabProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  teamMembers: any[];
}

export default function SettingsTab({ settings, onUpdateSettings, teamMembers }: SettingsTabProps) {
  const [targetUserId, setTargetUserId] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState('Info');
  const [sendingNotif, setSendingNotif] = useState(false);

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Platform config settings successfully committed.');
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !notifTitle.trim() || !notifMsg.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setSendingNotif(true);
    try {
      await api.post('api/v1/notifications', {
        userId: targetUserId,
        title: notifTitle.trim(),
        message: notifMsg.trim(),
        type: notifType
      });
      setNotifTitle('');
      setNotifMsg('');
      setTargetUserId('');
      alert('System alert notification dispatched successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to dispatch notification.');
    } finally {
      setSendingNotif(false);
    }
  };

  const getRoleName = (roleId: string) => {
    if (roleId === '11111111-1111-1111-1111-111111111111') return 'Admin';
    if (roleId === '22222222-2222-2222-2222-222222222222') return 'Farmer';
    if (roleId === '33333333-3333-3333-3333-333333333333') return 'Technician';
    return 'User';
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCommit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 w-full">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Telemetry and Alert Settings</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Moisture Alert Boundaries</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Minimum Soil Moisture Threshold (%)</label>
                <input 
                  type="number" 
                  value={settings.minMoistureThreshold} 
                  onChange={e => onUpdateSettings({ ...settings, minMoistureThreshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Maximum Temperature Threshold (°C)</label>
                <input 
                  type="number" 
                  value={settings.maxTempThreshold} 
                  onChange={e => onUpdateSettings({ ...settings, maxTempThreshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Broker Credentials & Alerts</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">MQTT Broker Gateway connection URI</label>
                <input 
                  type="text" 
                  value={settings.mqttBroker} 
                  onChange={e => onUpdateSettings({ ...settings, mqttBroker: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Email Addresses for System Alerts</label>
                <input 
                  type="text" 
                  value={settings.alertEmails} 
                  onChange={e => onUpdateSettings({ ...settings, alertEmails: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-700">Auto Leak Detection Protocol</h4>
              <p className="text-[10px] text-slate-400">Trigger alert flags if valve flow rates remain high while motor is idle.</p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, leakDetection: !settings.leakDetection })}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                settings.leakDetection ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              {settings.leakDetection ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Commit Settings
          </button>
        </div>
      </form>

      {/* Dispatch System Notifications Panel */}
      <form onSubmit={handleSendNotification} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 w-full">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Dispatch System Alert / Notification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Target Operator</label>
            <select
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none cursor-pointer font-semibold text-slate-750"
            >
              <option value="">-- Choose Operator --</option>
              {teamMembers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({getRoleName(u.role)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Notification Title</label>
            <input 
              type="text" 
              required
              value={notifTitle}
              onChange={e => setNotifTitle(e.target.value)}
              placeholder="e.g. Critical Outage Warning"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Alert Category</label>
            <select
              value={notifType}
              onChange={e => setNotifType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none cursor-pointer font-semibold"
            >
              <option value="Info">Information</option>
              <option value="Warning">Warning</option>
              <option value="Error">Critical Error</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Broadcast Message</label>
          <textarea
            required
            rows={2}
            value={notifMsg}
            onChange={e => setNotifMsg(e.target.value)}
            placeholder="Type alert warning details here..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-medium text-slate-700 bg-white"
          />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={sendingNotif}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 font-semibold cursor-pointer"
          >
            {sendingNotif ? 'Sending...' : 'Dispatch Alert'}
          </button>
        </div>
      </form>
    </div>
  );
}
