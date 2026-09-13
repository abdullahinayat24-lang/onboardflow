'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Download,
  Building2,
  Briefcase,
  Layers,
  History,
  Timer,
  CheckSquare,
  Sparkles,
  BarChart3,
  Award,
  Users,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { PerformanceReport, StaffWorkLog, ActivityLog, Staff } from '@/types';

export default function ReportsPage() {
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [workLogs, setWorkLogs] = useState<StaffWorkLog[]>([]);
  const [summary, setSummary] = useState<{
    total_staff: number;
    active_tasks: number;
    completed_tasks: number;
    total_hours_logged: number;
    average_performance_score: number;
    department_breakdown: Array<{ name: string; count: number; active_tasks: number }>;
  } | null>(null);
  const [auditLogs, setAuditLogs] = useState<ActivityLog[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'scorecards' | 'timesheet' | 'departments' | 'audit'>('scorecards');

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [searchStaff, setSearchStaff] = useState('');

  // Log Hours Dialog
  const [isLogHoursOpen, setIsLogHoursOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    staff_id: 'staff_alex',
    task_title: '',
    hours_spent: '3.0',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    description: '',
  });
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [resReports, resAudit, resStaff] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/audit'),
        fetch('/api/staff'),
      ]);

      const dataReports = await resReports.json();
      const dataAudit = await resAudit.json();
      const dataStaff = await resStaff.json();

      if (dataReports) {
        if (Array.isArray(dataReports.reports)) setReports(dataReports.reports);
        if (Array.isArray(dataReports.workLogs)) setWorkLogs(dataReports.workLogs);
        if (dataReports.summary) setSummary(dataReports.summary);
      }
      if (Array.isArray(dataAudit)) setAuditLogs(dataAudit);
      if (Array.isArray(dataStaff)) setStaffList(dataStaff);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.staff_id || !logForm.hours_spent) return;

    setSavingLog(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logForm),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.workLog) {
          setWorkLogs((prev) => [data.workLog, ...prev]);
        }
        setIsLogHoursOpen(false);
        // Refresh summary
        fetchReportsData();
      }
    } catch (err) {
      console.error('Failed to log hours:', err);
    } finally {
      setSavingLog(false);
    }
  };

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Staff Member', 'Date', 'Deliverable / Task', 'Scope Notes', 'Status', 'Hours Logged'];
    const rows = workLogs.map((log) => [
      `"${log.staff_name || 'Staff'}"`,
      `"${log.date}"`,
      `"${(log.task_title || '').replace(/"/g, '""')}"`,
      `"${(log.description || '').replace(/"/g, '""')}"`,
      `"${log.status}"`,
      `"${log.hours_spent}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agency-work-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (selectedDepartment !== 'all' && r.department !== selectedDepartment) return false;
    if (searchStaff.trim()) {
      const q = searchStaff.toLowerCase();
      if (!r.staff_name.toLowerCase().includes(q) && !r.department.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Filtered work logs
  const filteredWorkLogs = workLogs.filter((w) => {
    if (selectedMonth && !w.date.startsWith(selectedMonth)) return false;
    if (selectedDepartment !== 'all') {
      const staffMember = staffList.find((s) => s.id === w.staff_id);
      if (staffMember && staffMember.department !== selectedDepartment) return false;
    }
    if (searchStaff.trim()) {
      const q = searchStaff.toLowerCase();
      if (!w.staff_name?.toLowerCase().includes(q) && !w.task_title?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Agency Performance &amp; Operations Reporting
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            Team output analytics, monthly hours timesheets, department velocity, and work audit logging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleExportCSV}
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 text-xs font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            Export CSV
          </Button>

          <Button
            onClick={() => setIsLogHoursOpen(true)}
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Work Hours
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Team Size</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{summary?.total_staff || staffList.length}</p>
          <span className="text-[11px] text-zinc-400 font-medium">Active roster</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Active Tasks</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{summary?.active_tasks || 0}</p>
          <span className="text-[11px] text-zinc-400 font-medium">In execution</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Tasks Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{summary?.completed_tasks || 0}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Completed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Total Hours</span>
            <Timer className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-700">
            {summary?.total_hours_logged ? Number(summary.total_hours_logged).toFixed(1) : '35.0'}h
          </p>
          <span className="text-[11px] text-zinc-400 font-medium">Billable effort</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Agency Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {summary?.average_performance_score || 95}%
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Composite rating</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-1">
        <button
          onClick={() => setActiveTab('scorecards')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'scorecards'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Team Performance Scorecards ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('timesheet')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'timesheet'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          Hours Log &amp; Timesheets ({workLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'departments'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Department Velocity &amp; Capacity
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'audit'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Executive Work Audit
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-600">Department:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-900 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="SEO & Content">SEO & Content</option>
              <option value="Engineering & Dev">Engineering & Dev</option>
              <option value="Design & Creative">Design & Creative</option>
              <option value="Paid Media & Ads">Paid Media & Ads</option>
              <option value="Account Management">Account Management</option>
            </select>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-600">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-900 cursor-pointer"
            >
              <option value="2026-09">September 2026</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-11">November 2026</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Filter staff or deliverable..."
            value={searchStaff}
            onChange={(e) => setSearchStaff(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
          <p className="text-xs">Generating agency reports &amp; analytics...</p>
        </div>
      ) : (
        <>
          {/* Tab 1: Team Performance Scorecards */}
          {activeTab === 'scorecards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <div
                  key={report.staff_id}
                  className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                          {report.staff_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">{report.staff_name}</h3>
                          <p className="text-xs text-zinc-500 font-medium">{report.department}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-extrabold text-emerald-700">
                          {report.performance_score}%
                        </span>
                        <p className="text-[10px] text-zinc-400 uppercase font-semibold">Score</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs text-zinc-500 font-medium">
                        <span>Task Completion Rate</span>
                        <span className="font-bold text-zinc-900">{report.completion_rate}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${report.completion_rate}%` }}
                        />
                      </div>
                    </div>

                    {/* Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-zinc-100">
                      <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Completed</span>
                        <span className="font-bold text-emerald-600 text-sm">{report.tasks_completed}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Overdue</span>
                        <span className={`font-bold text-sm ${report.tasks_overdue > 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                          {report.tasks_overdue}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Hours</span>
                        <span className="font-bold text-indigo-700 text-sm">{Number(report.hours_logged).toFixed(1)}h</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                    <span>Active Clients: <strong>{report.active_clients_count}</strong></span>
                    <Link href={`/staff`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2">
                        View Staff Record
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Monthly Timesheet & Work Logs */}
          {activeTab === 'timesheet' && (
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Monthly Time &amp; Deliverables Timesheet</h3>
                  <p className="text-xs text-zinc-500">
                    Complete breakdown of all agency work hours logged against client deliverables.
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold text-xs">
                  {filteredWorkLogs.length} Records
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                    <tr>
                      <th className="p-3.5">Staff Member</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Deliverable Title</th>
                      <th className="p-3.5">Scope Notes</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Hours Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {filteredWorkLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-400">
                          No timesheet records match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredWorkLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-3.5 font-bold text-zinc-900 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                              {(log.staff_name || 'Staff').charAt(0)}
                            </div>
                            <span>{log.staff_name || 'Staff Member'}</span>
                          </td>
                          <td className="p-3.5 text-zinc-600 font-medium whitespace-nowrap">
                            {log.date}
                          </td>
                          <td className="p-3.5 font-semibold text-zinc-800 max-w-xs truncate">
                            {log.task_title || 'General Agency Task'}
                          </td>
                          <td className="p-3.5 text-zinc-500 max-w-sm truncate">
                            {log.description || 'Deliverable finalized.'}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                log.status === 'present'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-bold text-zinc-900">
                            {Number(log.hours_spent).toFixed(1)}h
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold text-xs text-zinc-900">
                    <tr>
                      <td colSpan={5} className="p-3.5 text-right">
                        Total Logged Hours:
                      </td>
                      <td className="p-3.5 text-right text-emerald-700 text-sm font-extrabold">
                        {filteredWorkLogs
                          .reduce((acc, curr) => acc + (Number(curr.hours_spent) || 0), 0)
                          .toFixed(1)}h
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Department Velocity & Capacity */}
          {activeTab === 'departments' && summary?.department_breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.department_breakdown.map((dept) => {
                const deptStaff = staffList.filter((s) => s.department === dept.name);
                const isOverloaded = dept.active_tasks > dept.count * 3;

                return (
                  <div
                    key={dept.name}
                    className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Department
                        </span>
                        <Badge
                          className={`text-[10px] font-bold ${
                            isOverloaded
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOverloaded ? 'High Load' : 'Healthy Capacity'}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900">{dept.name}</h3>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                          <span className="text-[11px] text-zinc-400 font-medium block">Team Members</span>
                          <span className="text-xl font-bold text-zinc-900">{dept.count}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                          <span className="text-[11px] text-zinc-400 font-medium block">Active Tasks</span>
                          <span className="text-xl font-bold text-blue-600">{dept.active_tasks}</span>
                        </div>
                      </div>

                      {/* Staff roster in department */}
                      <div className="mt-4 pt-3 border-t border-zinc-100">
                        <p className="text-xs font-semibold text-zinc-500 mb-2">Staff in Department</p>
                        <div className="flex flex-wrap gap-1.5">
                          {deptStaff.map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-800 px-2 py-1 rounded-md text-xs font-medium"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${s.is_online ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100">
                      <Link href={`/tasks`}>
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-8 gap-1">
                          View Department Tasks
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 4: Executive Work Audit */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Full Operational Audit Trail</h3>
                  <p className="text-xs text-zinc-500">
                    Comprehensive chronological ledger of all actions performed across the agency workspace.
                  </p>
                </div>
                <Badge className="bg-zinc-100 text-zinc-800 font-bold text-xs">
                  {auditLogs.length} Events Logged
                </Badge>
              </div>

              <div className="space-y-2.5">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60 flex items-start justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">{log.actor_name}</span>
                        <span className="text-zinc-400">•</span>
                        <span className="capitalize font-semibold text-emerald-700">
                          {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-600 font-medium">{log.entity_title}</span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <p className="text-[11px] text-zinc-400 font-mono">
                          {JSON.stringify(log.metadata)}
                        </p>
                      )}
                    </div>

                    <span className="text-[11px] text-zinc-400 whitespace-nowrap ml-4">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Log Work Hours Dialog */}
      <Dialog
        isOpen={isLogHoursOpen}
        onClose={() => setIsLogHoursOpen(false)}
        title="Log Work Hours &amp; Deliverables"
      >
        <form onSubmit={handleLogHoursSubmit} className="space-y-3.5 pt-2">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Staff Member</label>
            <select
              value={logForm.staff_id}
              onChange={(e) => setLogForm({ ...logForm, staff_id: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium"
              required
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Date</label>
              <Input
                type="date"
                value={logForm.date}
                onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                className="text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Hours Spent</label>
              <Input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                value={logForm.hours_spent}
                onChange={(e) => setLogForm({ ...logForm, hours_spent: e.target.value })}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Deliverable / Task Title</label>
            <Input
              placeholder="e.g. SEO Keyword Analysis or Brand Guidelines"
              value={logForm.task_title}
              onChange={(e) => setLogForm({ ...logForm, task_title: e.target.value })}
              className="text-xs h-9"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Description &amp; Milestones</label>
            <textarea
              placeholder="Summary of work completed..."
              value={logForm.description}
              onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLogHoursOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={savingLog}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              {savingLog ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Save Entry
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

