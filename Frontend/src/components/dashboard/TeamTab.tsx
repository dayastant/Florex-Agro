import React, { useState } from 'react';
import { Plus, Layers, Mail, Pencil, Trash, X, Check } from 'lucide-react';
import api from '../../services/api';

interface Farm {
  id: string;
  farmName: string;
  district: string;
  province: string;
  totalArea: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: string;
  assignedFarmId?: string;
  assignedFarmName?: string;
}

interface TeamTabProps {
  teamMembers: TeamMember[];
  farms: Farm[];
  onUserCreated: () => void;
  isLoading: boolean;
}

// Role GUID Constants from domain roles constants
const ROLE_ADMINISTRATOR_ID = '11111111-1111-1111-1111-111111111111';
const ROLE_FARMER_ID = '22222222-2222-2222-2222-222222222222';
const ROLE_TECHNICIAN_ID = '33333333-3333-3333-3333-333333333333';

export default function TeamTab({ teamMembers, farms, onUserCreated, isLoading }: TeamTabProps) {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLE_FARMER_ID);
  const [selectedFarmId, setSelectedFarmId] = useState('');

  // Editing User States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) return;

    try {
      // 1. Register User
      const registerRes = await api.post('api/v1/auth/register', {
        fullName,
        email,
        phone: phone || '+905554443322',
        password,
        roleId: selectedRole
      });

      const newUserId = registerRes.data.data;

      // 2. Allocate existing farm using PUT endpoint if selected
      if (selectedFarmId) {
        await api.put(`api/v1/farms/${selectedFarmId}/allocate`, {
          ownerId: newUserId
        });
      }

      // Reset Form State
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setSelectedRole(ROLE_FARMER_ID);
      setSelectedFarmId('');
      setIsAddingUser(false);
      
      // Refresh Parent State
      onUserCreated();
      alert('User account registered and farm allocated successfully!');
    } catch (err: any) {
      console.error('Error registering user:', err);
      alert(err.response?.data?.message || 'Failed to register operator account.');
    }
  };

  const handleAllocateFarmToUser = async (userId: string, farmId: string) => {
    try {
      if (farmId) {
        // Allocate selected farm to this user
        await api.put(`api/v1/farms/${farmId}/allocate`, {
          ownerId: userId
        });
      } else {
        // Unallocate: re-assign user's previous farm back to default admin owner
        const defaultAdminId = '99999999-9999-9999-9999-999999999999';
        const prevMember = teamMembers.find(m => m.id === userId);
        if (prevMember?.assignedFarmId) {
          await api.put(`api/v1/farms/${prevMember.assignedFarmId}/allocate`, {
            ownerId: defaultAdminId
          });
        }
      }
      onUserCreated();
      alert('Farm allocation updated successfully!');
    } catch (err: any) {
      console.error('Failed to allocate farm:', err);
      alert(err.response?.data?.message || 'Failed to update farm allocation.');
    }
  };

  const startEditUser = (member: TeamMember) => {
    setEditingUserId(member.id);
    setEditFullName(member.name);
    setEditEmail(member.email);
    setEditPhone(member.phone);
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditPassword('');
  };

  const handleUpdateUser = async (userId: string) => {
    if (!editFullName.trim() || !editEmail.trim()) return;

    try {
      await api.put(`api/v1/users/${userId}`, {
        id: userId,
        fullName: editFullName,
        email: editEmail,
        phone: editPhone || '+905554443322',
        roleId: editRole,
        status: editStatus,
        password: editPassword.trim() || undefined
      });

      setEditingUserId(null);
      setEditPassword('');
      onUserCreated();
      alert('Operator details updated successfully!');
    } catch (err: any) {
      console.error('Failed to update operator details:', err);
      alert(err.response?.data?.message || 'Failed to update operator details.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this operator account?')) return;

    try {
      await api.delete(`api/v1/users/${userId}`);
      onUserCreated();
      alert('Operator account deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err.response?.data?.message || 'Failed to delete operator.');
    }
  };

  const getRoleName = (roleId: string) => {
    if (roleId === ROLE_ADMINISTRATOR_ID) return 'Administrator';
    if (roleId === ROLE_FARMER_ID) return 'Farmer / Operator';
    if (roleId === ROLE_TECHNICIAN_ID) return 'Technician';
    return 'User';
  };

  const getFarmDisplayId = (name: string) => {
    const match = name.match(/^\[(.*?)\]/);
    return match ? match[1] : name;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Team Directory & Farm Allocations</h3>
          <p className="text-xs text-slate-400">Add operators and allocate specific land sectors directly from one view.</p>
        </div>
        <button
          onClick={() => setIsAddingUser(!isAddingUser)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-100/30"
        >
          <Plus className="h-4 w-4" />
          <span>{isAddingUser ? 'Close Form' : 'Register Operator'}</span>
        </button>
      </div>

      {/* Add User & Allocate Form */}
      {isAddingUser && (
        <form onSubmit={handleCreateUser} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 w-full">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">New Operator Account & Farm Allocation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                placeholder="e.g. Clara Oswald"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="e.g. clara@florax.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="e.g. +905553334411"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">System Role</label>
              <select 
                value={selectedRole} 
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={ROLE_FARMER_ID}>Farmer / Operator</option>
                <option value={ROLE_TECHNICIAN_ID}>Technician</option>
                <option value={ROLE_ADMINISTRATOR_ID}>Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Allocate Farm ID / Code</label>
              <select 
                value={selectedFarmId} 
                onChange={e => setSelectedFarmId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="">-- No Farm Allocated --</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{getFarmDisplayId(f.farmName)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setIsAddingUser(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Save Operator Account
            </button>
          </div>
        </form>
      )}

      {/* Team Table View */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        {isLoading ? (
          <div className="flex items-center gap-2 py-8 justify-center text-xs text-slate-400">
            <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Syncing team directory...</span>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-slate-400 text-xs py-8 text-center border rounded-xl bg-slate-50/50">
            No registered users found. Click "Register Operator" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">User Name</th>
                  <th className="pb-3 font-semibold">Contact Email</th>
                  <th className="pb-3 font-semibold">System Role</th>
                  <th className="pb-3 font-semibold">Status / Reset Pwd</th>
                  <th className="pb-3 font-semibold">Allocated Farm</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {teamMembers.map(member => {
                  const isEditing = editingUserId === member.id;
                  
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/40">
                      {isEditing ? (
                        /* Inline Row Edit Mode */
                        <>
                          <td className="py-2.5">
                            <input 
                              type="text" 
                              required
                              value={editFullName} 
                              onChange={e => setEditFullName(e.target.value)}
                              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs w-full focus:ring-1 focus:ring-emerald-500 focus:outline-none font-bold"
                            />
                          </td>
                          <td className="py-2.5">
                            <input 
                              type="email" 
                              required
                              value={editEmail} 
                              onChange={e => setEditEmail(e.target.value)}
                              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs w-full focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5">
                            <select 
                              value={editRole} 
                              onChange={e => setEditRole(e.target.value)}
                              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs w-full bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                            >
                              <option value={ROLE_FARMER_ID}>Farmer / Operator</option>
                              <option value={ROLE_TECHNICIAN_ID}>Technician</option>
                              <option value={ROLE_ADMINISTRATOR_ID}>Administrator</option>
                            </select>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-1.5">
                              <select 
                                value={editStatus} 
                                onChange={e => setEditStatus(e.target.value)}
                                className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700 w-24"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Deactivated">Deactivated</option>
                              </select>
                              <input 
                                type="password"
                                placeholder="New pwd"
                                value={editPassword}
                                onChange={e => setEditPassword(e.target.value)}
                                className="px-2 py-1 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none w-20"
                              />
                            </div>
                          </td>
                          <td className="py-2.5">
                            <span className="text-slate-400 text-xs italic pl-2.5">Save user to allocate</span>
                          </td>
                          <td className="py-2.5 text-right flex items-center justify-end gap-1.5 pt-3.5">
                            <button
                              onClick={() => handleUpdateUser(member.id)}
                              className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 hover:text-emerald-700 transition"
                              title="Save Changes"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-500 transition"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        /* Standard Read Mode */
                        <>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-bold text-slate-800">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-500 font-medium">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span>{member.email}</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className="font-semibold text-slate-700">
                              {getRoleName(member.role)}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider border ${
                              member.status === 'Active'
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                              {member.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <select
                                value={member.assignedFarmId || ''}
                                onChange={(e) => handleAllocateFarmToUser(member.id, e.target.value)}
                                className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer max-w-[150px] truncate"
                              >
                                <option value="">-- Unallocated --</option>
                                {farms.map(f => (
                                  <option key={f.id} value={f.id}>{getFarmDisplayId(f.farmName)}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="py-3.5 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => startEditUser(member)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition"
                              title="Edit User Details"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(member.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-655 transition"
                              title="Delete User"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
