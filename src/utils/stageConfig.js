export const PHASES = [
  { key: 'onboarding', label: 'Onboarding', color: '#4A7FC7', bg: '#EBF1FA' },
  { key: 'fulfillment', label: 'Fulfillment', color: '#3D8B8B', bg: '#EBF5F5' },
  { key: 'content', label: 'Content', color: '#C68A19', bg: '#FFF8EB' },
  { key: 'complete', label: 'Complete', color: '#3D8B5E', bg: '#EDF7F0' },
  { key: 'denied', label: 'Denied', color: '#C75B4A', bg: '#FDF0EE' },
];

export const STAGES = [
  { key: 'pre_invited', label: 'Pre-Invited', phase: 'onboarding', color: '#4A7FC7', bg: '#EBF1FA', helperText: 'Ready for review' },
  { key: 'invited', label: 'Invited', phase: 'onboarding', color: '#4A7FC7', bg: '#EBF1FA', helperText: 'Waiting for response...' },
  { key: 'accepted_invite', label: 'Accepted Invite', phase: 'onboarding', color: '#4A7FC7', bg: '#EBF1FA', helperText: 'Wants to learn more' },
  { key: 'accepted_campaign', label: 'Accepted Campaign', phase: 'onboarding', color: '#4A7FC7', bg: '#EBF1FA', helperText: 'Committed — ready for products' },
  { key: 'products_chosen', label: 'Products Chosen', phase: 'fulfillment', color: '#3D8B8B', bg: '#EBF5F5', helperText: 'Selected products from catalog' },
  { key: 'products_ordered', label: 'Products Ordered', phase: 'fulfillment', color: '#3D8B8B', bg: '#EBF5F5', helperText: 'Products in transit...' },
  { key: 'products_received', label: 'Products Received', phase: 'fulfillment', color: '#3D8B8B', bg: '#EBF5F5', helperText: 'Products confirmed delivered' },
  { key: 'waiting_for_content', label: 'Waiting for Content', phase: 'content', color: '#C68A19', bg: '#FFF8EB', helperText: 'Waiting for content...' },
  { key: 'content_submitted', label: 'Content Submitted', phase: 'content', color: '#C68A19', bg: '#FFF8EB', helperText: 'Awaiting review' },
  { key: 'content_approved', label: 'Content Approved', phase: 'content', color: '#C68A19', bg: '#FFF8EB', helperText: 'Cleared to post' },
  { key: 'posted', label: 'Posted', phase: 'complete', color: '#3D8B5E', bg: '#EDF7F0', helperText: 'Content live — verifying...' },
  { key: 'completed', label: 'Completed', phase: 'complete', color: '#3D8B5E', bg: '#EDF7F0', helperText: 'Journey complete' },
  { key: 'denied', label: 'Denied', phase: 'denied', color: '#C75B4A', bg: '#FDF0EE', helperText: 'Not selected' },
];

export const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.key, s]));
export const PHASE_MAP = Object.fromEntries(PHASES.map(p => [p.key, p]));

// Stages used in kanban (exclude denied — shown separately)
export const KANBAN_STAGES = STAGES.filter(s => s.key !== 'denied');

export const DEFAULT_TIME_LIMITS = {
  pre_invited: null,
  invited: 48,
  accepted_invite: 24,
  accepted_campaign: 48,
  products_chosen: 24,
  products_ordered: 168,
  products_received: 48,
  waiting_for_content: 168,
  content_submitted: 24,
  content_approved: 48,
  posted: 48,
  completed: null,
};

export const STAGE_TRANSITION_LABELS = [
  { from: 'pre_invited', to: 'invited', label: 'Pre-Invited → Invited' },
  { from: 'invited', to: 'accepted_invite', label: 'Invited → Accepted Invite' },
  { from: 'accepted_invite', to: 'accepted_campaign', label: 'Accepted Invite → Accepted Campaign' },
  { from: 'accepted_campaign', to: 'products_chosen', label: 'Accepted Campaign → Products Chosen' },
  { from: 'products_chosen', to: 'products_ordered', label: 'Products Chosen → Products Ordered' },
  { from: 'products_ordered', to: 'products_received', label: 'Products Ordered → Products Received' },
  { from: 'products_received', to: 'waiting_for_content', label: 'Products Received → Waiting for Content' },
  { from: 'waiting_for_content', to: 'content_submitted', label: 'Waiting for Content → Content Submitted' },
  { from: 'content_submitted', to: 'content_approved', label: 'Content Submitted → Content Approved' },
  { from: 'content_approved', to: 'posted', label: 'Content Approved → Posted' },
  { from: 'posted', to: 'completed', label: 'Posted → Completed' },
];

export function getStageIndex(key) {
  return STAGES.findIndex(s => s.key === key);
}

export function getPhaseForStage(stageKey) {
  const stage = STAGE_MAP[stageKey];
  return stage ? PHASE_MAP[stage.phase] : null;
}

export function formatTimeLimit(hours) {
  if (hours === null) return 'No limit';
  if (hours < 24) return `${hours} hours`;
  const days = hours / 24;
  return days === 1 ? '1 day' : `${days} days`;
}

// Campaign Brief Data
export const CAMPAIGN_BRIEFS = {
  camp1: {
    whatCreatorsWillDo: {
      post: '1 post on their primary platform (TikTok or Instagram). Posted from the creator\'s own account.',
      benable: 'Post about Pikora on Benable (included in every campaign).',
      contentIdeas: [
        'First sip reaction — what did you expect vs. what you got?',
        'Morning routine featuring your Pikora broth',
        'Quick recipe or creative way you use it',
      ],
      talkingPoints: [
        'The Latin-inspired flavors and whether they surprised you',
        'How it fits into your wellness or cooking routine',
        'Whether you\'d swap your morning coffee or tea for it',
      ],
      link: 'https://benable.com/pecora',
    },
    brandGuidelines: {
      dos: [
        'Show the product in use (not just the packaging)',
        'Tag @holapikora and #pikora',
        'Focus on authenticity — share your real experience',
        'Create a 15–30 second video',
        'Your content may be reposted by Pikora on their channels with credit to you',
      ],
      donts: [
        'Don\'t feature competitor products in the same post',
        'Don\'t make medical or health claims',
      ],
    },
  },
  camp2: {
    whatCreatorsWillDo: {
      post: '1 post on their primary platform (TikTok or Instagram). Posted from the creator\'s own account.',
      benable: 'Post about 28 Litsea on Benable (included in every campaign).',
      contentIdeas: [
        'Morning skincare routine featuring 28 Litsea',
        'Evening wind-down ritual',
        'Before-and-after skin texture',
      ],
      talkingPoints: [
        'The natural ingredients and how your skin feels',
        'Whether it replaced another product in your routine',
        'The scent and sensory experience',
      ],
      link: 'https://benable.com/28litsea',
    },
    brandGuidelines: {
      dos: [
        'Feature product in morning or evening skincare routine',
        'Tag @28litsea and #28litsea',
        'Show product packaging clearly at some point',
        'Soft, natural lighting preferred',
        'Create a 15–30 second video',
      ],
      donts: [
        'Don\'t feature competitor skincare products in the same post',
        'Don\'t make medical or dermatological claims',
      ],
    },
  },
};

// Legacy compat
export const CAMPAIGN_REQUIREMENTS = {
  camp1: CAMPAIGN_BRIEFS.camp1.brandGuidelines.dos,
  camp2: CAMPAIGN_BRIEFS.camp2.brandGuidelines.dos,
};
