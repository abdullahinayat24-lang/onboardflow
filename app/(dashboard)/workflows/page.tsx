'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Workflow as WorkflowIcon,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Layers,
  Plus,
  Edit3,
  Send,
  Building2,
  FileText,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckSquare,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { CreateTaskModal } from '@/components/dashboard/create-task-modal';
import { Workflow, WorkflowStage, Staff, Client, Task, TaskStatus, TaskPriority } from '@/types';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Workflow & Stage
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);

  // Notes state for editing
  const [stageNotes, setStageNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [advancingStage, setAdvancingStage] = useState(false);

  // Create Task Modal
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resWf, resStaff, resClients, resTasks] = await Promise.all([
        fetch('/api/workflows'),
        fetch('/api/staff'),
        fetch('/api/clients'),
        fetch('/api/tasks'),
      ]);

      const dataWf = await resWf.json();
      const dataStaff = await resStaff.json();
      const dataClients = await resClients.json();
      const dataTasks = await resTasks.json();

      const wfList: Workflow[] = dataWf.workflows || [];
      setWorkflows(wfList);
      if (wfList.length > 0 && !selectedWorkflowId) {
        setSelectedWorkflowId(wfList[0].id);
        setSelectedStageIndex((wfList[0].current_stage_index || 1) - 1);
      }

      if (Array.isArray(dataStaff)) setStaffList(dataStaff);
      if (Array.isArray(dataClients)) setClients(dataClients);
      if (Array.isArray(dataTasks)) setTasks(dataTasks);
    } catch (err) {
      console.error('Failed to load workflows data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
  const activeClient = activeWorkflow?.client_id
    ? clients.find((c) => c.id === activeWorkflow.client_id)
    : null;

  const currentStage =
    activeWorkflow && activeWorkflow.stages && activeWorkflow.stages[selectedStageIndex]
      ? activeWorkflow.stages[selectedStageIndex]
      : null;

  // Sync stage notes when stage changes
  useEffect(() => {
    if (currentStage) {
      setStageNotes(currentStage.notes || '');
    }
  }, [currentStage?.id]);

  // Advance stage action
  const handleAdvanceStage = async () => {
    if (!activeWorkflow) return;
    setAdvancingStage(true);
    try {
      const res = await fetch(`/api/workflows/${activeWorkflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'advance_stage',
          notes: stageNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedWf: Workflow = data.workflow;
        setWorkflows((prev) => prev.map((w) => (w.id === updatedWf.id ? updatedWf : w)));
        // Select newly current stage
        const newIdx = (updatedWf.current_stage_index || 1) - 1;
        setSelectedStageIndex(newIdx < updatedWf.stages.length ? newIdx : updatedWf.stages.length - 1);
      }
    } catch (err) {
      console.error('Failed to advance stage:', err);
    } finally {
      setAdvancingStage(false);
    }
  };

  // Save notes only
  const handleSaveNotes = async () => {
    if (!activeWorkflow || !currentStage) return;
    setSavingNotes(true);
    try {
      const updatedStages = activeWorkflow.stages.map((s) =>
        s.id === currentStage.id ? { ...s, notes: stageNotes } : s
      );

      const res = await fetch(`/api/workflows/${activeWorkflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stages: updatedStages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWorkflows((prev) => prev.map((w) => (w.id === data.workflow.id ? data.workflow : w)));
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Reassign stage responsible staff
  const handleReassignStaff = async (newStaffId: string) => {
    if (!activeWorkflow || !currentStage) return;
    try {
      const updatedStages = activeWorkflow.stages.map((s) =>
        s.id === currentStage.id ? { ...s, responsible_staff_id: newStaffId } : s
      );

      const res = await fetch(`/api/workflows/${activeWorkflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stages: updatedStages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWorkflows((prev) => prev.map((w) => (w.id === data.workflow.id ? data.workflow : w)));
      }
    } catch (err) {
      console.error('Failed to reassign staff:', err);
    }
  };

  // Filter tasks belonging to current stage or active workflow client
  const stageTasks = tasks.filter((t) => {
    if (!activeWorkflow) return false;
    if (currentStage && t.workflow_stage_id === currentStage.id) return true;
    if (t.client_id === activeWorkflow.client_id) return true;
    return false;
  });

  // Calculate high-level pipeline stats
  const totalStagesCompleted = workflows.reduce(
    (acc, w) => acc + (w.stages ? w.stages.filter((s) => s.status === 'completed').length : 0),
    0
  );
  const totalStages = workflows.reduce((acc, w) => acc + (w.stages ? w.stages.length : 0), 0);

  const getResponsibleStaff = (staffId: string | null | undefined) => {
    if (!staffId) return null;
    return staffList.find((s) => s.id === staffId);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Workflow Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Layers className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              5-Stage Delivery Pipeline Engine
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            Standardized fulfillment engine: Weekly Audit → Strategy Kickoff → Client Execution → Quality Review → Final Delivery &amp; Retainer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Workflow Switcher */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-600">Client Pipeline:</span>
            <select
              value={selectedWorkflowId}
              onChange={(e) => {
                setSelectedWorkflowId(e.target.value);
                const found = workflows.find((w) => w.id === e.target.value);
                if (found) {
                  setSelectedStageIndex((found.current_stage_index || 1) - 1);
                }
              }}
              className="bg-transparent border-0 text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
            >
              {workflows.map((w) => {
                const clientObj = clients.find((c) => c.id === w.client_id);
                return (
                  <option key={w.id} value={w.id}>
                    {clientObj?.company || clientObj?.name || w.name} ({w.status.toUpperCase()})
                  </option>
                );
              })}
            </select>
          </div>

          <Button
            onClick={() => setIsCreateTaskOpen(true)}
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Deliverable Task
          </Button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Active Pipelines</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{workflows.length}</p>
          <span className="text-[11px] text-zinc-400 font-medium">Client fulfillment flows</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Pipeline Progress</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {totalStagesCompleted} / {totalStages}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Stages completed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Execution Status</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-700 capitalize">
            {activeWorkflow?.status || 'Active'}
          </p>
          <span className="text-[11px] text-zinc-400 font-medium">
            Stage {activeWorkflow?.current_stage_index || 1} of 5 in execution
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Fulfillment SLA</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">100% On-Track</p>
          <span className="text-[11px] text-emerald-600 font-medium">Zero bottleneck delays</span>
        </div>
      </div>

      {loading || !activeWorkflow ? (
        <div className="p-16 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
          <p className="text-xs">Loading workflow pipeline...</p>
        </div>
      ) : (
        <>
          {/* Horizontal 5-Stage Interactive Pipeline Stepper */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <span>{activeWorkflow.name}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold text-[10px] uppercase">
                    {activeWorkflow.status}
                  </Badge>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Click any stage card to inspect deliverables, update operational notes, or advance the pipeline.
                </p>
              </div>

              {activeClient && (
                <Link href={`/clients/${activeClient.id}`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    {activeClient.company || activeClient.name} Portal
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {activeWorkflow.stages.map((stage, idx) => {
                const isCurrent = (activeWorkflow.current_stage_index || 1) === stage.order_index;
                const isCompleted = stage.status === 'completed';
                const isSelected = selectedStageIndex === idx;
                const respStaff = getResponsibleStaff(stage.responsible_staff_id);

                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStageIndex(idx)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                        : isCurrent
                        ? 'border-emerald-300 bg-white hover:border-emerald-400'
                        : isCompleted
                        ? 'border-zinc-200 bg-zinc-50/60 hover:border-zinc-300'
                        : 'border-zinc-200 bg-zinc-50/30 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div>
                      {/* Top status indicator */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] bg-zinc-100 text-zinc-700">
                          {idx + 1}
                        </span>

                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Done
                          </span>
                        ) : isCurrent ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
                            <RefreshCw className="w-3 h-3 text-emerald-700 animate-spin" />
                            In Progress
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-zinc-400">
                            Upcoming
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-zinc-900 line-clamp-2">
                        {stage.title.replace(/^Stage \d+:\s*/, '')}
                      </h3>

                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                        {stage.description}
                      </p>
                    </div>

                    {/* Bottom Assignee Info */}
                    <div className="mt-4 pt-2.5 border-t border-zinc-200/60 flex items-center justify-between text-[11px] text-zinc-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate font-medium">
                          {respStaff?.name || 'Assigned Lead'}
                        </span>
                      </div>
                      {stage.due_date && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {stage.due_date.split('T')[0].slice(5)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Stage Detail & Operator Console */}
          {currentStage && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left 2 Cols: Stage Control Console */}
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Stage {currentStage.order_index} of 5
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 mt-2">
                        {currentStage.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{currentStage.description}</p>
                    </div>

                    {/* Primary Advance Button */}
                    <div className="flex items-center gap-2">
                      {currentStage.status !== 'completed' ? (
                        <Button
                          onClick={handleAdvanceStage}
                          disabled={advancingStage}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-xs"
                        >
                          {advancingStage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                          Complete &amp; Advance Stage
                        </Button>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold text-xs px-3 py-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Stage Completed
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stage Meta Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <span className="text-[11px] text-zinc-400 font-semibold block mb-1">
                        Responsible Operator
                      </span>
                      <select
                        value={currentStage.responsible_staff_id || ''}
                        onChange={(e) => handleReassignStaff(e.target.value)}
                        className="bg-transparent font-bold text-zinc-800 focus:outline-none w-full cursor-pointer text-xs"
                      >
                        <option value="">Select Staff...</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.department})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <span className="text-[11px] text-zinc-400 font-semibold block mb-1">
                        Target Due Date
                      </span>
                      <p className="font-bold text-zinc-800">
                        {currentStage.due_date ? currentStage.due_date.split('T')[0] : 'In SLA Window'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <span className="text-[11px] text-zinc-400 font-semibold block mb-1">
                        Completion Timestamp
                      </span>
                      <p className="font-bold text-zinc-800">
                        {currentStage.completed_at
                          ? new Date(currentStage.completed_at).toLocaleDateString()
                          : 'Pending Execution'}
                      </p>
                    </div>
                  </div>

                  {/* Operational Notes & Hand-off Log */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        Stage Execution Notes &amp; Hand-off Checklist
                      </label>
                      <Button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2"
                      >
                        {savingNotes ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Save Notes
                      </Button>
                    </div>
                    <textarea
                      value={stageNotes}
                      onChange={(e) => setStageNotes(e.target.value)}
                      placeholder="Add operational findings, meeting minutes, Figma file links, or QA review results..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none min-h-[90px]"
                    />
                  </div>
                </div>

                {/* Stage Linked Tasks */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        Stage Deliverables &amp; Work Items ({stageTasks.length})
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Tasks linked to this client and workflow execution.
                      </p>
                    </div>

                    <Button
                      onClick={() => setIsCreateTaskOpen(true)}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold text-emerald-700 border-emerald-600 hover:bg-emerald-50 gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </Button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {stageTasks.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                        No specific deliverables logged yet. Click "+ Add Task" to assign sub-work.
                      </div>
                    ) : (
                      stageTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 bg-zinc-50/40 flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                task.status === 'completed'
                                  ? 'bg-emerald-500'
                                  : task.priority === 'urgent'
                                  ? 'bg-rose-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <div>
                              <p className="font-bold text-zinc-900">{task.title}</p>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                                <span>{task.department}</span>
                                <span>•</span>
                                <span>
                                  Assignee: {staffList.find((s) => s.id === task.assigned_to)?.name || 'Team Lead'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                task.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-zinc-200 text-zinc-700'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Col: Client Onboarding & AI Brief Context */}
              <div className="space-y-5">
                {activeClient && (
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">
                          {activeClient.company || activeClient.name}
                        </h4>
                        <p className="text-xs text-zinc-500">{activeClient.email}</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-bold uppercase">
                        {activeClient.project_status === 'ready_for_project'
                          ? 'Ready for Project'
                          : activeClient.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Service Category:</span>
                        <span className="font-bold text-zinc-800 capitalize">
                          {activeClient.service_category?.replace('_', ' ') || 'Marketing Retainer'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Account Manager:</span>
                        <span className="font-bold text-zinc-800">
                          {staffList.find((s) => s.id === activeClient.manager_id)?.name || 'Priya Patel'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Intake Token:</span>
                        <span className="font-mono text-[11px] text-zinc-600 truncate max-w-[150px]">
                          {activeClient.onboarding_token}
                        </span>
                      </div>
                    </div>

                    {/* AI Project Brief Card */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/70 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        AI Executive Brief Synthesized
                      </div>
                      <p className="text-[11px] text-emerald-950/80 leading-relaxed">
                        Automatic intake synthesis prepared key goals, target audience, brand assets, and fulfillment roadmap upon client submission.
                      </p>
                      <Link href={`/clients/${activeClient.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 h-7 text-xs font-bold border-emerald-600 text-emerald-800 hover:bg-emerald-100/60"
                        >
                          View Full AI Brief &amp; Intake
                        </Button>
                      </Link>
                    </div>

                    {/* Quick Link Buttons */}
                    <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
                      <Link href={`/clients/${activeClient.id}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-8 gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                          Client Management Portal
                        </Button>
                      </Link>
                      <Link href={`/tasks`}>
                        <Button variant="ghost" size="sm" className="w-full text-xs font-semibold h-8 text-zinc-600">
                          View Agency Kanban Board
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agency Workflows Summary Roster */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">All Client Fulfillment Workflows</h3>
                <p className="text-xs text-zinc-500">
                  Global overview of all client accounts traversing the 5-stage agency delivery engine.
                </p>
              </div>
              <Badge className="bg-zinc-100 text-zinc-800 border-0 font-bold text-xs">
                {workflows.length} Active Pipelines
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="p-3.5">Client &amp; Account</th>
                    <th className="p-3.5">Pipeline Name</th>
                    <th className="p-3.5">Active Stage</th>
                    <th className="p-3.5">Stage Responsible</th>
                    <th className="p-3.5 text-center">Progress</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {workflows.map((wf) => {
                    const clientObj = clients.find((c) => c.id === wf.client_id);
                    const currStage = wf.stages.find((s) => s.order_index === (wf.current_stage_index || 1));
                    const respStaff = getResponsibleStaff(currStage?.responsible_staff_id);
                    const completedCount = wf.stages.filter((s) => s.status === 'completed').length;
                    const progressPercent = Math.round((completedCount / (wf.stages.length || 1)) * 100);

                    return (
                      <tr
                        key={wf.id}
                        className={`hover:bg-zinc-50 transition-colors ${
                          wf.id === selectedWorkflowId ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        <td className="p-3.5 font-bold text-zinc-900">
                          {clientObj?.company || clientObj?.name || 'Internal'}
                        </td>
                        <td className="p-3.5 text-zinc-600 font-medium">
                          {wf.name}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                            Stage {wf.current_stage_index}: {currStage?.title.replace(/^Stage \d+:\s*/, '')}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-600 font-medium">
                          {respStaff?.name || 'Assigned Lead'}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-1.5 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="font-bold text-[11px] text-zinc-800">
                              {completedCount}/5
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            onClick={() => {
                              setSelectedWorkflowId(wf.id);
                              setSelectedStageIndex((wf.current_stage_index || 1) - 1);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          >
                            Inspect Pipeline
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={() => {
          fetchInitialData();
        }}
      />
    </div>
  );
}

