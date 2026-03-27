import { useState, useMemo } from 'react';
import { Upload, Send, BadgeCheck, Eye as EyeIcon, MoreHorizontal, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import StatusBadge, { LiveBadge, ArchivedBadge, DaysBadge } from '../components/StatusBadge';
import Avatar, { BrandAvatar } from '../components/Avatar';
import { getUrgencyState, getUrgencyCardStyles } from '../utils/urgency';
import CreatorModal from '../components/CreatorModal';
import NudgeDialog from '../components/NudgeDialog';
import ImportDialog from '../components/ImportDialog';
import CreatorSetupCard from '../components/CreatorSetupCard';
import { STAGES, PHASES, STAGE_MAP, KANBAN_STAGES } from '../utils/stageConfig';
import { formatFollowers, formatEngagement } from '../utils/formatters';

export default function CampaignDetailContent({ campaignId }) {
  const { creators, campaigns, moveCreatorStage, addToast, logActivity } = useAppState();
  const campaign = campaigns.find(c => c.id === campaignId);
  const campaignCreators = creators.filter(c => c.campaignId === campaignId);

  const [view, setView] = useState('kanban');
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [nudgeCreator, setNudgeCreator] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [dragCreator, setDragCreator] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [selectedSetup, setSelectedSetup] = useState([]);
  const [top3, setTop3] = useState([]);

  const handleDrop = (stageKey) => {
    if (dragCreator && dragCreator.stage !== stageKey) {
      const oldLabel = STAGE_MAP[dragCreator.stage]?.label;
      const newLabel = STAGE_MAP[stageKey]?.label;
      const prevStage = dragCreator.stage;
      const creatorId = dragCreator.id;
      moveCreatorStage(creatorId, stageKey);
      logActivity(`Moved ${dragCreator.name} from ${oldLabel} to ${newLabel}`, 'Kate', creatorId);
      addToast(`Moved ${dragCreator.name} to ${newLabel}`, 'success', () => {
        moveCreatorStage(creatorId, prevStage);
      });
    }
    setDragCreator(null);
    setDropTarget(null);
  };

  // Grouped list sections
  const listSections = useMemo(() => {
    const needReview = campaignCreators.filter(c => c.stage === 'content_submitted');
    const needsAttention = campaignCreators.filter(c => c.isOverdue && c.stage !== 'content_submitted');
    const approved = campaignCreators.filter(c => ['content_approved', 'posted'].includes(c.stage) && !c.isOverdue);
    const completed = campaignCreators.filter(c => c.stage === 'completed');
    const denied = campaignCreators.filter(c => c.stage === 'denied');
    const inProgressStages = ['pre_invited', 'invited', 'accepted_invite', 'accepted_campaign', 'products_chosen', 'products_ordered', 'products_received', 'waiting_for_content'];
    const inProgress = campaignCreators.filter(c => inProgressStages.includes(c.stage) && !c.isOverdue);
    return [
      { key: 'review', label: 'Needs Review', color: '#C68A19', bg: '#FFF8EB', items: needReview, defaultOpen: true, actionType: 'review' },
      { key: 'attention', label: 'Needs Your Attention', color: '#ea580c', bg: '#FFF7ED', items: needsAttention, defaultOpen: true, actionType: 'nudge' },
      { key: 'progress', label: 'In Progress', color: '#4A7FC7', bg: '#EBF1FA', items: inProgress, defaultOpen: true, actionType: 'view' },
      { key: 'approved', label: 'Approved — Waiting to Post', color: '#3D8B5E', bg: '#EDF7F0', items: approved, defaultOpen: true, actionType: 'preview' },
      { key: 'completed', label: 'Completed', color: '#9E9B97', bg: '#F5F4F1', items: completed, defaultOpen: false, actionType: 'view' },
      { key: 'denied', label: 'Denied', color: '#C75B4A', bg: '#FDF0EE', items: denied, defaultOpen: false, actionType: 'view' },
    ].filter(s => s.items.length > 0);
  }, [campaignCreators]);

  const preInvitedCreators = campaignCreators.filter(c => c.stage === 'pre_invited');

  if (!campaign) return <div style={{ padding: 32 }}>Campaign not found.</div>;

  return (
    <div style={{ padding: 'var(--space-6) var(--space-8)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <BrandAvatar initial={campaign.name[0]} size={48} photo={campaign.logo} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>{campaign.name}</h1>
              {campaign.status === 'live' ? <LiveBadge /> : <ArchivedBadge />}
            </div>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Started {campaign.createdAt}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(true)}>
            <Upload size={14} /> Import Creators
          </button>
          <div style={styles.toggle}>
            {['setup', 'kanban', 'list'].map(v => (
              <button key={v} style={{ ...styles.toggleBtn, ...(view === v ? styles.toggleActive : {}) }} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SETUP VIEW ===== */}
      {view === 'setup' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Creator Setup ({preInvitedCreators.length} pre-invited)</h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {selectedSetup.length > 0 && (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    selectedSetup.forEach(id => moveCreatorStage(id, 'invited'));
                    addToast(`${selectedSetup.length} creators invited`);
                    setSelectedSetup([]);
                  }}>Invite Selected ({selectedSetup.length})</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => {
                    selectedSetup.forEach(id => moveCreatorStage(id, 'denied'));
                    addToast(`${selectedSetup.length} creators denied`);
                    setSelectedSetup([]);
                  }}>Mark as Denied</button>
                </>
              )}
            </div>
          </div>
          {preInvitedCreators.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>No creators imported yet.</p>
              <button className="btn btn-primary" onClick={() => setShowImport(true)}>Import Creators</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {preInvitedCreators.map(creator => (
                <CreatorSetupCard
                  key={creator.id}
                  creator={creator}
                  isSelected={selectedSetup.includes(creator.id)}
                  onToggleSelect={() => setSelectedSetup(prev => prev.includes(creator.id) ? prev.filter(id => id !== creator.id) : [...prev, creator.id])}
                  isTop3={top3.includes(creator.id)}
                  onToggleTop3={() => setTop3(prev => prev.includes(creator.id) ? prev.filter(id => id !== creator.id) : [...prev, creator.id])}
                  onInvite={(id) => { moveCreatorStage(id, 'invited'); addToast(`${creator.name} invited`); }}
                  onDeny={(id) => { moveCreatorStage(id, 'denied'); addToast(`${creator.name} denied`); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== KANBAN VIEW ===== */}
      {view === 'kanban' && (
        <div style={styles.kanban}>
          {PHASES.filter(p => p.key !== 'denied').map(phase => {
            const phaseStages = KANBAN_STAGES.filter(s => s.phase === phase.key);
            const phaseCreators = campaignCreators.filter(c => phaseStages.some(s => s.key === c.stage));
            return (
              <div key={phase.key} style={styles.phaseGroup}>
                <div style={{ ...styles.phaseLabel, color: phase.color }}>
                  <span style={{ ...styles.phaseDot, background: phase.color }} />
                  {phase.label}
                  <span style={styles.phaseCount}>{phaseCreators.length}</span>
                </div>
                <div style={styles.stageColumns}>
                  {phaseStages.map(stage => {
                    const stageCreators = campaignCreators
                      .filter(c => c.stage === stage.key)
                      .sort((a, b) => (a.isOverdue === b.isOverdue ? b.daysInStage - a.daysInStage : a.isOverdue ? -1 : 1));
                    const isDropping = dropTarget === stage.key && dragCreator?.stage !== stage.key;
                    const isReviewColumn = stage.key === 'content_submitted';
                    const hasReviewItems = isReviewColumn && stageCreators.length > 0;
                    return (
                      <div
                        key={stage.key}
                        style={{
                          ...styles.column,
                          ...(isDropping ? styles.columnDrop : {}),
                          ...(hasReviewItems ? styles.columnReview : {}),
                        }}
                        onDragOver={e => { e.preventDefault(); setDropTarget(stage.key); }}
                        onDragLeave={() => setDropTarget(null)}
                        onDrop={() => handleDrop(stage.key)}
                      >
                        <div style={styles.colHeader}>
                          <span style={styles.colTitle}>{stage.label}</span>
                          <span style={styles.colCount}>{stageCreators.length}</span>
                        </div>
                        <div style={styles.colCards}>
                          {stageCreators.length === 0 ? (
                            <div style={styles.emptyCol}>Drop here</div>
                          ) : stageCreators.map(creator => {
                            const urgency = getUrgencyState(creator);
                            const urgStyles = getUrgencyCardStyles(urgency.state, true);
                            const isReviewCard = creator.stage === 'content_submitted';
                            return (
                            <div
                              key={creator.id}
                              className={isReviewCard ? 'review-glow' : ''}
                              style={{
                                ...styles.card,
                                ...urgStyles,
                                ...(isReviewCard ? styles.cardReview : {}),
                                opacity: dragCreator?.id === creator.id ? 0.4 : (urgStyles.opacity || 1),
                                transition: 'all 0.2s ease',
                              }}
                              draggable
                              onDragStart={() => setDragCreator(creator)}
                              onClick={() => setSelectedCreator(creator)}
                            >
                              {/* Row 1: Avatar + Name + urgency icon */}
                              <div style={styles.cardRow1}>
                                <Avatar initials={creator.initials} size={40} photo={creator.photo} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ ...styles.cardName, fontWeight: urgency.state === 'overdue' || urgency.state === 'due_soon' ? 700 : 600 }}>{creator.name}</span>
                                    <BadgeCheck size={14} color="#5B8EC9" />
                                  </div>
                                  <div style={styles.cardHandle}>{creator.handle}</div>
                                </div>
                                {/* Urgency icon — top right */}
                                {urgency.state === 'overdue' && (
                                  <span style={{ ...styles.urgencyIconInner, background: 'var(--overdue-icon-bg)', color: 'var(--overdue-text)' }}>!</span>
                                )}
                                {urgency.state === 'due_soon' && (
                                  <span style={{ ...styles.urgencyIconInner, background: 'var(--due-soon-icon-bg)', color: 'var(--due-soon-text)' }}><Clock size={12} /></span>
                                )}
                              </div>
                              {/* Row 2: Status text — full width below photo+name */}
                              <div style={{
                                fontSize: 12,
                                fontWeight: urgency.state === 'overdue' || urgency.state === 'due_soon' ? 600 : 400,
                                color: urgency.state === 'overdue' ? 'var(--overdue-text)' : urgency.state === 'due_soon' ? 'var(--due-soon-text)' : 'var(--color-text-tertiary)',
                                marginTop: 6,
                                textDecoration: urgency.state === 'done' ? 'line-through' : 'none',
                              }}>
                                {urgency.actionText}
                              </div>
                            </div>
                          );})}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== GROUPED LIST VIEW ===== */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {listSections.map(section => (
            <ListSection key={section.key} section={section} onCreatorClick={setSelectedCreator} onNudge={setNudgeCreator} />
          ))}
        </div>
      )}

      {selectedCreator && <CreatorModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} />}
      {nudgeCreator && <NudgeDialog creator={nudgeCreator} campaign={campaign} onClose={() => setNudgeCreator(null)} />}
      {showImport && <ImportDialog campaignId={campaignId} campaignName={campaign.name} onClose={() => setShowImport(false)} />}
    </div>
  );
}

/* ─── Grouped List Section (matches Benable table UI) ─── */
function ListSection({ section, onCreatorClick, onNudge }) {
  const { approveContent, rejectContent, addToast } = useAppState();
  const [isOpen, setIsOpen] = useState(section.defaultOpen);
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  return (
    <div style={ls.sectionWrap}>
      {/* Section header band */}
      <div style={{ ...ls.sectionHeader, background: section.bg }} onClick={() => setIsOpen(!isOpen)}>
        <span style={{ ...ls.sectionLabel, color: section.color }}>{section.label}</span>
        <span style={{ marginLeft: 'auto', color: section.color, fontSize: 13, cursor: 'pointer' }}>{isOpen ? '▾' : '▸'}</span>
      </div>

      {isOpen && (
        <div style={ls.tableWrap}>
          {/* Column headers */}
          <div style={ls.colHeaders}>
            <span style={{ ...ls.colH, flex: '1 1 30%' }}>Creator</span>
            <span style={{ ...ls.colH, flex: '0 0 150px' }}>Creator status</span>
            <span style={{ ...ls.colH, flex: '1 1 20%', textAlign: 'right' }}></span>
            <span style={{ ...ls.colH, flex: '0 0 160px', textAlign: 'right' }}>Actions</span>
          </div>

          {/* Rows */}
          {section.items.map(creator => {
            const urgency = getUrgencyState(creator);
            // Only left border for overdue — no background wash
            const overdueLeftBorder = urgency.state === 'overdue' ? { boxShadow: 'inset 4px 0 0 var(--overdue-border)' } : {};
            const isReviewExpanded = expandedReviewId === creator.id;

            return (
            <div key={creator.id}>
              <div style={{ ...ls.row, ...overdueLeftBorder }}>
                {/* Creator */}
                <div style={ls.creatorCell}>
                  <Avatar initials={creator.initials} size={32} photo={creator.photo} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={ls.creatorName} onClick={() => onCreatorClick(creator)}>{creator.name}</span>
                      <BadgeCheck size={14} color="#5B8EC9" />
                    </div>
                    <div style={ls.creatorHandle}>{creator.handle}</div>
                  </div>
                </div>

                {/* Status */}
                <div style={{ flex: '0 0 150px' }}>
                  <StatusBadge stage={creator.stage} />
                </div>

                {/* Urgency action text (right-aligned) */}
                <div style={{
                  flex: '1 1 20%', textAlign: 'right', fontSize: 11, minWidth: 120,
                  fontWeight: urgency.state === 'overdue' || urgency.state === 'due_soon' ? 600 : 500,
                  color: urgency.state === 'overdue' ? 'var(--overdue-text)' : urgency.state === 'due_soon' ? 'var(--due-soon-text)' : '#888',
                }}>
                  {urgency.actionText}
                </div>

                {/* Actions + urgency icon on far right */}
                <div style={ls.actionsCell}>
                  {section.actionType === 'review' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setExpandedReviewId(isReviewExpanded ? null : creator.id)}>
                      <EyeIcon size={12} /> {isReviewExpanded ? 'Close' : 'Review'}
                    </button>
                  )}
                  {section.actionType === 'nudge' && (
                    <button className="btn btn-primary btn-sm" onClick={() => onNudge(creator)}>
                      <Send size={12} /> Send Nudge
                    </button>
                  )}
                  {section.actionType === 'preview' && (
                    <button className="btn btn-outlined btn-sm" onClick={() => onCreatorClick(creator)}>
                      <EyeIcon size={12} /> Preview
                    </button>
                  )}
                  {section.actionType === 'view' && (
                    <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{STAGE_MAP[creator.stage]?.helperText}</span>
                  )}
                  {/* Urgency icon — right side */}
                  {urgency.state === 'overdue' && (
                    <span style={{ ...ls.urgIconInner, background: 'var(--overdue-icon-bg)', color: 'var(--overdue-text)' }}>!</span>
                  )}
                  {urgency.state === 'due_soon' && (
                    <span style={{ ...ls.urgIconInner, background: 'var(--due-soon-icon-bg)', color: 'var(--due-soon-text)' }}><Clock size={12} /></span>
                  )}
                  <button style={ls.moreBtn}><MoreHorizontal size={16} /></button>
                </div>
              </div>

              {/* Inline review expansion */}
              {isReviewExpanded && creator.contentSubmission && (
                <div style={ls.reviewPanel}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ background: 'var(--color-bg-sidebar)', borderRadius: 8, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                      {creator.contentSubmission.type === 'video' ? '▶ Video' : '📷 Photo'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>CAPTION</div>
                      <p style={{ fontSize: 13, lineHeight: '20px' }}>{creator.contentSubmission.caption}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <button className="btn btn-primary btn-sm" style={{ background: '#3D8B5E' }} onClick={() => { approveContent(creator.id); setExpandedReviewId(null); }}>
                      ✓ Approve
                    </button>
                    <div style={{ flex: 1 }}>
                      <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Feedback for creator..." style={{ width: '100%', minHeight: 48, fontSize: 13, fontFamily: 'inherit', padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 6, outline: 'none', marginBottom: 6, resize: 'vertical' }} />
                      <button className="btn btn-danger btn-sm" disabled={!feedbackText.trim()} onClick={() => { rejectContent(creator.id, feedbackText); setFeedbackText(''); setExpandedReviewId(null); }}>
                        ✗ Reject + Feedback
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );})
          }
        </div>
      )}
    </div>
  );
}

/* ─── List Section Styles (matching Benable table UI) ─── */
const ls = {
  sectionWrap: {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    outline: '1px solid var(--color-border)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    cursor: 'pointer',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 600,
  },
  tableWrap: {},
  colHeaders: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 24px',
    gap: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border)',
  },
  colH: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: '14px 24px',
    borderBottom: '1px solid var(--color-border)',
    minHeight: 60,
    transition: 'background 100ms ease',
  },
  creatorCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    flex: '1 1 30%',
    minWidth: 0,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
  },
  creatorHandle: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  actionsCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    flex: '0 0 140px',
    justifyContent: 'flex-end',
  },
  urgIconInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 5, fontSize: 12, fontWeight: 700, flexShrink: 0 },
  reviewPanel: { padding: '16px 24px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-sidebar)' },
  moreBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-tertiary)',
    padding: 4,
    display: 'flex',
    borderRadius: 'var(--radius-sm)',
  },
};

/* ─── General Styles ─── */
const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' },
  toggle: { display: 'flex', outline: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' },
  toggleBtn: { background: 'var(--color-bg-card)', border: 'none', padding: '6px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-secondary)', transition: 'all 150ms ease' },
  toggleActive: { background: 'var(--color-accent)', color: 'var(--color-accent-text)' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-10)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', outline: '1px solid var(--color-border)' },
  kanban: { display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', paddingBottom: 'var(--space-4)', alignItems: 'flex-start', minWidth: 0 },
  phaseGroup: { flex: '1 0 auto', minWidth: 220 },
  collapsedPhase: { flex: '0 0 auto', padding: 'var(--space-3)', background: 'var(--color-bg-sidebar)', borderRadius: 'var(--radius-xl)', minWidth: 100, textAlign: 'center' },
  phaseLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 0 var(--space-2)' },
  phaseDot: { width: 8, height: 8, borderRadius: 'var(--radius-full)' },
  phaseCount: { fontSize: 11, fontWeight: 600, background: 'var(--color-bg-hover)', borderRadius: 'var(--radius-full)', padding: '0 6px', color: 'var(--color-text-secondary)', lineHeight: '18px' },
  stageColumns: { display: 'flex', gap: 'var(--space-2)', alignItems: 'stretch' },
  column: { flex: '1 0 160px', maxWidth: 300, background: 'var(--color-bg-sidebar)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-3)', outline: '2px solid transparent', transition: 'outline-color 150ms ease', alignSelf: 'stretch', minHeight: 120 },
  emptyCol: { padding: '24px 12px', textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', opacity: 0.6 },
  columnDrop: { outline: '2px dashed var(--color-accent)' },
  columnReview: { background: 'rgba(239, 68, 68, 0.08)', outline: '2px solid rgba(239, 68, 68, 0.25)' },
  colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-1) var(--space-2)' },
  colTitle: { fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' },
  colCount: { fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-full)', padding: '0 6px', lineHeight: '18px' },
  colCards: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' },
  card: { background: '#fff', outline: '1px solid #e8e8f0', borderRadius: 10, padding: '12px 14px', cursor: 'pointer' },
  cardReview: { background: '#FFF3E0', outline: '1px solid #e8e8f0', boxShadow: 'inset 4px 0 0 #F59E0B' },
  urgencyIcon: { flexShrink: 0 },
  urgencyIconInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 5, fontSize: 12, fontWeight: 700 },
  cardRow1: { display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' },
  cardName: { fontSize: 15, fontWeight: 600, lineHeight: '22px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardHandle: { fontSize: 13, color: 'var(--color-text-secondary)' },
  nichePill: { display: 'inline-block', fontSize: 12, padding: '2px 10px', borderRadius: 'var(--radius-full)', outline: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', marginBottom: 6, marginTop: 4 },
  cardStats: { display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' },
  statItem: { display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.3px' },
  statValue: { fontSize: 13, fontWeight: 600 },
  cardBottom: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' },
};
