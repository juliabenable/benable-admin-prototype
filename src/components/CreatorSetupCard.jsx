import { useState } from 'react';
import { GripVertical, Star, BadgeCheck } from 'lucide-react';
import Avatar from './Avatar';
import { formatFollowers, formatEngagement } from '../utils/formatters';

export default function CreatorSetupCard({ creator, onInvite, onDeny, isSelected, onToggleSelect, onToggleTop3, isTop3 }) {
  const [platform, setPlatform] = useState(creator.platform || 'ig');
  const [selectedPosts, setSelectedPosts] = useState([0, 1, 2]); // mock: first 3 selected

  const mockPosts = Array.from({ length: 6 }, (_, i) => ({ id: i, label: `Post ${i + 1}` }));

  return (
    <div style={styles.card}>
      <div style={styles.leftCol}>
        {/* Drag handle */}
        <div style={styles.dragHandle}><GripVertical size={16} color="var(--color-text-tertiary)" /></div>

        {/* Select checkbox */}
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect} style={styles.checkbox} />

        {/* Creator info */}
        <Avatar initials={creator.initials} size={64} photo={creator.photo} />
        <div style={styles.info}>
          <div style={styles.nameRow}>
            <span style={styles.name}>{creator.name}</span>
            <BadgeCheck size={14} color="#5B8EC9" />
            {isTop3 && <span style={styles.top3Badge}><Star size={12} /> Top 3</span>}
          </div>
          <div style={styles.handle}>{creator.handle} · {creator.city || 'Unknown'}</div>
          <div style={styles.stats}>
            {formatFollowers(creator.followers)} · {formatEngagement(creator.engagement)} eng
            {creator.avgViews && ` · ${formatFollowers(creator.avgViews)} avg views`}
          </div>
          <span style={styles.nichePill}>{creator.niche}</span>
        </div>
      </div>

      <div style={styles.rightCol}>
        {/* Platform toggle */}
        <div style={styles.platformToggle}>
          <button style={{ ...styles.platBtn, ...(platform === 'ig' ? styles.platActive : {}) }} onClick={() => setPlatform('ig')}>IG</button>
          <button style={{ ...styles.platBtn, ...(platform === 'tiktok' ? styles.platActive : {}) }} onClick={() => setPlatform('tiktok')}>TikTok</button>
          <button style={{ ...styles.platBtn, ...(platform === 'both' ? styles.platActive : {}) }} onClick={() => setPlatform('both')}>Both</button>
        </div>

        {/* Showcase posts */}
        <div style={styles.postsGrid}>
          {mockPosts.map(post => (
            <div
              key={post.id}
              onClick={() => setSelectedPosts(prev => prev.includes(post.id) ? prev.filter(p => p !== post.id) : [...prev, post.id])}
              style={{
                ...styles.postThumb,
                outline: selectedPosts.includes(post.id) ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
              }}
            >
              <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>{post.label}</span>
              {selectedPosts.includes(post.id) && <span style={styles.postCheck}>✓</span>}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.starBtn} onClick={onToggleTop3} title="Toggle Top 3">
            <Star size={16} fill={isTop3 ? '#C68A19' : 'none'} color={isTop3 ? '#C68A19' : 'var(--color-text-tertiary)'} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onInvite(creator.id)}>Invite</button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => onDeny(creator.id)}>Deny</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
    padding: 'var(--space-4) var(--space-5)',
    background: 'var(--color-bg-card)',
    outline: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
  },
  leftCol: { display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flex: 1, minWidth: 0 },
  dragHandle: { cursor: 'grab', padding: '4px 0', marginTop: 20 },
  checkbox: { marginTop: 22, cursor: 'pointer', accentColor: 'var(--color-accent)' },
  info: { flex: 1, minWidth: 0 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 },
  name: { fontSize: 15, fontWeight: 600 },
  top3Badge: { display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, color: '#C68A19', background: '#FFF8EB', padding: '1px 6px', borderRadius: 'var(--radius-full)' },
  handle: { fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 2 },
  stats: { fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 },
  nichePill: { fontSize: 12, padding: '1px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-neutral-light)', color: 'var(--color-text-tertiary)' },
  rightCol: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-3)', flexShrink: 0 },
  platformToggle: { display: 'flex', outline: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' },
  platBtn: { background: 'var(--color-bg-card)', border: 'none', padding: '4px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-secondary)' },
  platActive: { background: 'var(--color-accent)', color: '#fff' },
  postsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gap: 4 },
  postThumb: { width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' },
  postCheck: { position: 'absolute', top: 2, right: 2, fontSize: 10, color: 'var(--color-accent)', fontWeight: 700 },
  actions: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)' },
  starBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 'var(--radius-sm)' },
};
