# P.U.L.S.E - Technical Specification

## 1. Project Overview

**Project Name:** P.U.L.S.E (Profiler Updater Liaison Support Entity)
**Slogan:** Your AI-Powered Messaging Command Center
**Former Name:** GCP (Gangster Computer Profiler) - now the personality engine
**Type:** Mobile-first SaaS Application
**Framework:** React Native with Native Modules (Android-first)
**Platform Priority:** Android (Phase 1), iOS (Phase 2)
**Core Summary:** AI-powered messaging app that unifies SMS, RCS, and social media into one interface. Features an embedded AI assistant (P.U.L.S.E) that reads/summarizes incoming messages, offers to snooze them for later, and analyzes contact dispositions from both messages and call logs. The personality profiling engine (formerly GCP) runs in the background to build Big Five profiles from all conversations.
**Target Users:** Individuals seeking to understand their own communication style, improve relationships, and track emotional well-being.
**Data Storage:** Local-first with `.md` profile files stored on device, with optional Google Drive cloud backup
**Monetization:** Deferred - build all features first, decide paywall placement later

---

## 2. UI/UX Structure

### 2.1 Screen Architecture

```
App Root
├── Splash Screen
├── Onboarding Flow (3 screens)
│   ├── Permissions Request
│   ├── Message Access Setup
│   └── Initial Profile Build
└── Main Tab Navigation (5 tabs)
    ├── 📊 Dashboard (Home)
    ├── 👥 Contacts
    ├── 🧠 Explore Personality
    ├── 📝 Journal
    └── ⚙️ Settings
```

### 2.2 Screen Specifications

#### 2.2.1 Dashboard (Home Tab)
- **Purpose:** User overview with quick stats, mood summary, recent insights
- **Components:**
  - Header: User avatar, name, "Ask GCP" input field
  - Mood Card: Current mood slider, today's journal prompt
  - Quick Stats: Messages analyzed, contacts profiled, relationship health score
  - Recent Insights: Scrollable list of AI-generated tips
  - Tag Cloud: Visual representation of user tags

#### 2.2.2 Contacts Tab
- **Purpose:** Full contact list with search, filters, and quick actions
- **Components:**
  - Search Bar: Filter contacts by name/tags
  - Filter Chips: All, Close Friends, Acquaintances, Family, Work
  - Contact Cards: Avatar, name, last message preview, relationship score badge
  - FAB: Add new contact manually

#### 2.2.3 Contact Detail Screen (Push)
- **Purpose:** Full analytics for individual contact
- **Components:**
  - Header: Avatar, name, tags, relationship duration
  - Big Five Radar Chart: OCEAN profile comparison
  - Relationship Balance Card: Message count, response times, length, initiation frequency
  - Emoji Usage: Most used emojis by each party
  - Trend Graph: Interaction frequency over time (30/60/90 days)
  - Communication Tips: AI-suggested bridging strategies
  - Message History: Scrollable conversation timeline

#### 2.2.4 Explore Personality Tab
- **Purpose:** Deep dive into Big Five model
- **Components:**
  - OCEAN Overview: 5 dimension cards with overall scores
  - Trait Explorer: Expandable sections for each dimension's 6 traits
  - Your Profile: Detailed breakdown with examples from messages
  - Comparison Tool: Select contact to compare profiles
  - Learning Resources: Tips for each trait dimension

#### 2.2.5 Journal Tab
- **Purpose:** Daily mood tracking and journaling
- **Components:**
  - Today's Entry: Large mood slider (😢 → 😊), journal text input
  - Calendar View: Month grid showing mood colors
  - History List: Past entries with mood icons
  - Streak Counter: Consecutive days logged
  - Mood Trends: Line graph of mood over time

#### 2.2.6 Settings Tab
- **Purpose:** App configuration and data management
- **Components:**
  - Profile Management: Edit user profile, reset analysis
  - Message Loader: Manual trigger, sync status, last sync time
  - Google Drive Backup: Enable/disable, manual backup/restore, sync status
  - Notifications: Reminder settings, insight frequency
  - Data & Storage: Export data, clear cache, storage usage
  - Permissions: Message access, call log, notifications
  - About: Version, privacy policy, terms

### 2.3 Navigation Structure

| Screen | Navigation Type | Parent |
|--------|----------------|--------|
| Dashboard | Tab | Root |
| Contacts | Tab | Root |
| Contact Detail | Push | Contacts |
| Explore Personality | Tab | Root |
| Trait Detail | Push | Explore Personality |
| Journal | Tab | Root |
| Settings | Tab | Root |
| Ask GCP Modal | Modal | Any |

### 2.4 Component Library

**Base Components:**
- `GCPButton` - Primary, Secondary, Ghost, Destructive variants
- `GCPCard` - Elevated surface with shadow
- `GCPAvatar` - User/contact avatars with status indicator
- `GCPMoodSlider` - Custom slider with emoji endpoints
- `GCPInput` - Text input with validation states
- `GCPChip` - Tag/filter chips
- `GCPProgressBar` - Linear and circular variants
- `GCPChart` - Line, bar, radar chart components
- `GCPModal` - Bottom sheet and full-screen modals

**Shared Props:**
- Border radius: 12px (cards), 8px (buttons), 20px (chips)
- Colors: Primary #6366F1, Secondary #8B5CF6, Success #10B981, Warning #F59E0B, Error #EF4444
- Typography: System fonts, base 16px, scale 1.25

---

## 3. Data Models

### 3.1 Profile Schema (Markdown)

```markdown
---
id: uuid
type: user | contact
name: string
created_at: ISO8601
updated_at: ISO8601
tags: string[]
source: string (message_source | manual)
---

# Personality Profile

## Big Five (OCEAN) Scores

### Openness (0-100)
- Overall: 72
- Traits:
  - Imagination: 80
  - Artistic Interests: 65
  - Emotionality: 75
  - Adventurousness: 70
  - Intellect: 78
  - Liberalism: 64

### Conscientiousness (0-100)
- Overall: 68
- Traits:
  - Self-Discipline: 72
  - Orderliness: 60
  - Dutifulness: 75
  - Achievement-Striving: 70
  - Self-Efficacy: 68
  - Cautiousness: 65

### Extroversion (0-100)
- Overall: 58
- Traits:
  - Gregariousness: 55
  - Assertiveness: 60
  - Activity-Level: 62
  - Excitement-Seeking: 55
  - Cheerfulness: 65
  - Positive-Emotion: 58

### Agreeableness (0-100)
- Overall: 75
- Traits:
  - Trust: 80
  - Straightforwardness: 70
  - Altruism: 78
  - Compliance: 72
  - Modesty: 68
  - Tender-Mindedness: 82

### Neuroticism (0-100)
- Overall: 45
- Traits:
  - Anxiety: 40
  - Angry-Hostility: 50
  - Depression: 45
  - Self-Consciousness: 48
  - Impulsiveness: 55
  - Vulnerability: 38

## Communication Style
- Preferred tone: [casual, formal, humorous]
- Response pattern: [quick, thoughtful, sporadic]
- Emoji usage: moderate
- Punctuation: standard

## Relationship Metrics
- Messages exchanged: 1,247
- Avg response time: 2.3 hours
- Avg message length: 45 chars
- Initiation ratio: 60/40

## Recent Messages (Sample)
> "Hey! How's the new project going?"
> "Can't wait for the weekend 🎉"
```

### 3.2 Message Schema

```typescript
type Platform = 'sms' | 'rcs' | 'messenger' | 'instagram' | 'whatsapp' | 'telegram' | 'discord' | 'signal' | 'slack' | 'imessage';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: ISO8601;
  platform: Platform;
  captureMethod: 'notification' | 'accessibility' | 'content_resolver' | 'api' | 'manual_export';
  metadata: {
    hasEmoji: boolean;
    emojiCount: number;
    hasPunctuation: boolean;
    punctuationCount: number;
    wordCount: number;
    isQuestion: boolean;
    isExclamation: boolean;
    sentiment: 'positive' | 'negative' | 'neutral';
  };
}
```

### 3.3 Mood Entry Schema

```typescript
interface MoodEntry {
  id: string;
  userId: string;
  date: ISO8601; // YYYY-MM-DD
  moodScore: number; // 1-10 scale
  journalText: string;
  triggers: string[]; // ["work", "family", "health"]
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

### 3.4 Conversation Schema

```typescript
interface Conversation {
  id: string;
  participants: string[]; // userId + contactId
  contactId: string;
  platform: string;
  messageCount: number;
  firstMessageAt: ISO8601;
  lastMessageAt: ISO8601;
  relationshipScore: number; // 0-100
}
```

### 3.5 Storage Structure

```
/localdata
├── /profiles
│   ├── /user
│   │   └── profile.md
│   └── /contacts
│       ├── {contact-uuid}.md
│       └── ...
├── /messages
│   ├── /conversations
│   │   └── {conversation-uuid}.json
│   └── /raw
│       └── {platform}.json
├── /mood
│   └── entries.json
├── /insights
│   └── cache.json
└── /settings
    └── config.json
```

---

## 4. Big Five Scoring Algorithm

### 4.1 Overview

The Big Five (OCEAN) model consists of five major dimensions, each with six sub-traits:
- **Openness:** Imagination, Artistic Interests, Emotionality, Adventurousness, Intellect, Liberalism
- **Conscientiousness:** Self-Discipline, Orderliness, Dutifulness, Achievement-Striving, Self-Efficacy, Cautiousness
- **Extroversion:** Gregariousness, Assertiveness, Activity-Level, Excitement-Seeking, Cheerfulness, Positive-Emotion
- **Agreeableness:** Trust, Straightforwardness, Altruism, Compliance, Modesty, Tender-Mindedness
- **Neuroticism:** Anxiety, Angry-Hostility, Depression, Self-Consciousness, Impulsiveness, Vulnerability

### 4.2 Scoring Approach

**Phase 1: Message Feature Extraction**
```
For each message, extract:
- Word count, character count
- Emoji count and types
- Punctuation patterns (!, ?, ..., caps usage)
- Question frequency
- Sentiment score (NLP-based)
- Response time (when available)
- Time of day patterns
- Topic keywords
```

**Phase 2: Trait Indicators Mapping**

| OCEAN Dimension | Positive Indicators | Negative Indicators |
|-----------------|---------------------|----------------------|
| Openness | Creative words, emoji variety, questions, abstract concepts | Repetitive language, few questions, concrete only |
| Conscientiousness | Long messages, proper grammar, planning words, follow-ups | Short messages, spontaneous, cancellations |
| Extroversion | High message volume, quick responses, exclamations, group texts | Low volume, long response times, private messages |
| Agreeableness | Gratitude, agreement markers, soft language, questions | Criticism, disagreements, confrontational |
| Neuroticism | Apologies, worry words, long response times, emotional words | Calm language, quick resolutions |

**Phase 3: Trait Scoring Algorithm**

```typescript
interface TraitScorer {
  // Each trait gets a score 0-100
  calculateTraitScore(
    messages: Message[],
    traitIndicators: TraitIndicator[]
  ): number;
  
  // Weight recent messages more heavily
  applyTemporalWeighting(
    messages: Message[],
    halfLifeDays: number = 30
  ): WeightedMessage[];
  
  // Combine sub-traits into dimension score
  aggregateDimensionScore(
    traitScores: number[]
  ): number; // weighted average
}

// Scoring formula
score = (Σ feature_score × trait_correlation × recency_weight) / total_weight
```

**Phase 4: Confidence & Stability**

- Minimum messages required: 50 for initial profile
- Confidence interval narrows with more messages
- Re-score with each new message batch
- Track score changes over time (stability metric)

### 4.3 Comparison Algorithm

```typescript
interface PersonalityComparison {
  calculateDifference(
    profileA: BigFiveProfile,
    profileB: BigFiveProfile
  ): DifferenceResult;
  
  generateBridgingTips(
    differences: DifferenceResult
  ): CommunicationTip[];
}

// Bridge tips based on dimension differences
if (extroversion.diff > 20) {
  tips.push("Your contact is more outgoing. Consider more spontaneous messages.");
}
if (agreeableness.diff < -15) {
  tips.push("They value harmony. Frame disagreements gently.");
}
```

---

## 5. Message Loader Architecture

### 5.1 Overview

The Message Loader is an AI agent responsible for:
1. Scanning device messages and social media platforms
2. Building the initial message database
3. Handling profile merges (when contacts appear across platforms)
4. Triggering personality re-analysis on new data

### 5.2 Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Message Loader                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Platform     │  │ Message      │  │ Profile      │      │
│  │ Connectors   │  │ Parser       │  │ Merger       │      │
│  │              │  │              │  │              │      │
│  │ - SMS        │  │ - Dedupe     │  │ - ID mapping │      │
│  │ - WhatsApp   │  │ - Normalize  │  │ - Merge rules│      │
│  │ - Telegram   │  │ - Extract    │  │ - Conflict   │      │
│  │ - Messenger  │  │              │  │   resolution │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          ▼                                   │
│              ┌─────────────────────┐                        │
│              │  Analysis Trigger    │                        │
│              │  (Real-time/Batch)  │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Platform Connectors

The Message Loader supports multiple platforms with varying access methods. Priority order for implementation:

| Priority | Platform | Access Method | Android | iOS |
|----------|----------|---------------|---------|-----|
| **P0** | **SMS/MMS** | ContentResolver / NotificationListener | ✅ | Limited |
| **P0** | **RCS** | ContentResolver / NotificationListener | ✅ | - |
| **P0** | **Facebook Messenger** | NotificationListener / Accessibility | ✅ | Deferred |
| **P1** | **Instagram DM** | NotificationListener / Graph API | ✅ | Deferred |
| **P2** | WhatsApp | NotificationListener / Local DB backup | ✅ | Manual export |
| **P2** | Telegram | NotificationListener + Bot API | ✅ | Deferred |
| **P2** | Discord | Accessibility Service / Notification | ✅ | Deferred |
| **P3** | Signal | Local DB (encrypted) / Notification | ✅ | Manual |
| **P3** | Slack | NotificationListener / Web API | ✅ | ✅ |
| **P3** | iMessage | - | - | Deferred |

**SMS/MMS (P0 - First):**
- Android: ContentResolver query on `sms`, `mms` tables + NotificationListenerService
- Native Android API - highest reliability
- iOS: Requires Notification Service Extension (iOS 16+ for third-party apps)

**RCS (P0 - Second):**
- Android: ContentResolver query on `rcs` tables (carrier-dependent)
- NotificationListenerService for RCS messages
- Limited carrier support but growing

**Facebook Messenger (P0 - Third):**
- Android: NotificationListenerService + AccessibilityService for deeper capture
- Graph API as fallback for authorized users
- Large user base makes this high priority

**Instagram DM (P1):**
- Android: NotificationListenerService captures DMs
- Graph API for historical data (requires user permission)
- Limited by Instagram's API restrictions

**WhatsApp (P2):**
- Android: NotificationListenerService for real-time + `msgstore.db` backup for historical
- iOS: Notification Service Extension + manual chat export
- Lower priority due to WhatsApp's encryption and restrictions

**Telegram (P2):**
- Android: NotificationListenerService + optional Bot API for specific chats
- Lower priority - smaller user base, better privacy controls

**Discord (P2):**
- Android: AccessibilityService to capture DM and channel messages from Discord UI
- Note: Discord ToS prohibits automated data collection; use for personal analysis only

**iMessage (P3 - iOS only):**
- Deferred to iOS phase
- Limited API access - may require manual export

### 5.4 Message Parser

```typescript
interface MessageParser {
  // Parse raw platform data to normalized messages
  parse(rawData: RawMessage[]): Message[];
  
  // Deduplicate across platforms
  deduplicate(messages: Message[]): Message[];
  
  // Extract metadata (emoji, sentiment, etc.)
  enrich(messages: Message[]): EnrichedMessage[];
}
```

### 5.5 Profile Merger

```typescript
interface ProfileMerger {
  // Detect same person across platforms
  detectContactMatches(contacts: Contact[]): Match[];
  
  // Merge contact profiles
  mergeContacts(primary: Contact, secondary: Contact[]): MergedContact;
  
  // Handle conflicts (different names, numbers, etc.)
  resolveConflicts(contacts: Contact[]): Resolution;
}
```

### 5.6 Sync Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| Initial | First run | Full scan all platforms, build database |
| Real-time | Background service | New message notification → immediate parse |
| Manual | User action | Selective platform re-scan |
| Scheduled | Cron (daily) | Batch sync during low-usage hours |

---

## 6. Background Service Design

### 6.1 Service Architecture

The background service uses a layered approach combining native platform services with cross-platform workers:

```
┌─────────────────────────────────────────────────────────────┐
│                   Background Service                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Native Real-Time Layer                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │ Android      │  │ iOS          │  │ Cross-    │  │   │
│  │  │ Notification │  │ Notification │  │ Platform  │  │   │
│  │  │ Listener     │  │ Extension    │  │ Worker    │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Platform Bridge (React Native)          │   │
│  │         Native Module → EventEmitter → JS            │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│         ┌─────────────────────────────────┐                │
│         │     Processing Queue            │                │
│         │  (Serial for data integrity)    │                │
│         └─────────────────────────────────┘                │
│                          ▼                                  │
│         ┌─────────────────────────────────┐                │
│         │     Analysis Engine             │                │
│         │  - Profile Update               │                │
│         │  - Insight Generation           │                │
│         │  - Notification Trigger        │                │
│         └─────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 6.1.1 Real-Time Message Capture

**Android:**
- `NotificationListenerService`: Receives all notifications in real-time
- `AccessibilityService`: Extracts messages directly from app UI (deeper access)
- Works even when app is closed (service runs independently)

**iOS:**
- `UNNotificationServiceExtension`: Intercepts notifications before display
- `BGAppRefreshTask`: Periodic background sync (limited to ~30s)
- `BGProcessingTask`: Heavy analysis tasks during charging/WiFi

### 6.2 Android Implementation

**Primary: NotificationListenerService (Real-time)**
```kotlin
// Real-time message capture via notifications
class GcpNotificationService : NotificationListenerService() {
    private val supportedApps = listOf(
        "com.whatsapp", "com.discord", "org.telegram.messenger",
        "com.facebook.orca", "com.instagram.android",
        "com.oplus.sms", "com.android.mms"
    )
    
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val package = sbn?.packageName ?: return
        if (package !in supportedApps) return
        
        val extras = sbn.notification.extras
        val message = Message(
            content = extras.getCharSequence(EXTRA_TEXT)?.toString() ?: "",
            sender = extras.getCharSequence(EXTRA_TITLE)?.toString() ?: "",
            timestamp = sbn.postTime,
            platform = mapToPlatform(package),
            captureMethod = "notification"
        )
        
        // Push to React Native via EventEmitter
        sendEvent("onNewMessage", message.toJson())
    }
}
```

**Secondary: AccessibilityService (Deep capture)**
```kotlin
// Deep message extraction from app UI
class GcpAccessibilityService : AccessibilityService() {
    private val messagingPackages = setOf("com.discord", "com.whatsapp")
    
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val package = event?.packageName?.toString() ?: return
        if (package !in messagingPackages) return
        
        // Find message text nodes in the view hierarchy
        val messages = findMessageNodes(event.source)
        messages.forEach { node ->
            val text = node.text?.toString()
            if (text != null && isValidMessage(text)) {
                processMessage(text, package)
            }
        }
    }
    
    private fun findMessageNodes(root: AccessibilityNodeInfo?): List<AccessibilityNodeInfo> {
        // Recursively find text nodes containing message content
        // Different strategies per app (Discord, WhatsApp, etc.)
    }
}
```

**WorkManager for Periodic Tasks:**
```kotlin
// Periodic work (hourly check)
val periodicWork = PeriodicWorkRequestBuilder<MessageSyncWorker>(
  1, TimeUnit.HOURS,
  15, TimeUnit.MINUTES // flex interval
)
  .setConstraints(NetworkType.UNMETERED)
  .build()

// One-time work (on new message detected)
val urgentWork = OneTimeWorkRequestBuilder<ProcessNewMessageWorker>()
  .setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)
  .build()
```

**ContentObserver for SMS (Fallback):**
```kotlin
class SmsObserver(contentResolver: ContentResolver) : ContentObserver(Handler()) {
  override fun onChange(selfChange: Boolean) {
    // Query new messages, push to processing queue
  }
}
```

### 6.3 iOS Implementation

**Notification Service Extension (Real-time capture):**
```swift
// Intercept notifications before they're displayed
class NotificationService: UNNotificationServiceExtension {
    
    private var contentHandler: ((UNNotificationContent) -> Void)?
    private var bestAttemptContent: UNMutableNotificationContent?
    
    override func didReceive(_ request: UNNotificationRequest,
                            withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
        
        let userInfo = request.content.userInfo
        guard let package = userInfo["package"] as? String,
              isSupportedPackage(package) else {
            contentHandler(request.content)
            return
        }
        
        // Extract message content
        if let messageBody = request.content.body as String? {
            let message = MessageData(
                content: messageBody,
                sender: request.content.title,
                timestamp: request.date,
                platform: mapToPlatform(package),
                captureMethod: "notification"
            )
            
            // Save to App Group container for main app access
            saveToSharedContainer(message)
        }
        
        contentHandler(bestAttemptContent ?? request.content)
    }
    
    private func isSupportedPackage(_ package: String) -> Bool {
        return ["whatsapp", "discord", "telegram", "messenger", "instagram"].contains(package)
    }
}
```

**Background Tasks:**
```swift
// BGAppRefreshTask for periodic sync
BGTaskScheduler.shared.register(
  forTaskWithIdentifier: "com.gcp.message-sync",
  using: nil
) { task in
  // Schedule next sync, process new messages
}

// BGProcessingTask for heavy analysis
BGTaskScheduler.shared.register(
  forTaskWithIdentifier: "com.gcp.profile-analysis",
  using: nil
) { task in
  // Run personality analysis in background
}

// App Group for sharing data between extension and main app
let appGroupID = "group.com.gcp.shared"
```

### 6.4 Processing Queue

```typescript
interface ProcessingQueue {
  // Serial queue for data integrity
  enqueue(message: Message): Promise<void>;
  
  // Batch processing for efficiency
  batch(messages: Message[]): Promise<void>;
  
  // Priority queue for urgent processing
  priorityEnqueue(message: Message): Promise<void>;
}
```

### 6.5 Battery Optimization

- **Sync frequency:** Adaptive based on message volume
- **Network:** Only sync on WiFi or unmetered (configurable)
- **Batch processing:** Group messages, process in chunks
- **Exponential backoff:** On failures, increase delay progressively

### 6.6 Call Log Integration

```typescript
interface CallLogAnalyzer {
  // Analyze call patterns
  analyzeCallPatterns(calls: Call[]): CallPatternReport;
  
  // Detect relationship indicators
  detectRelationshipIndicators(
    callFrequency: number,
    avgDuration: number,
    missedCalls: number
  ): RelationshipIndicator;
}

// Call data fields
interface Call {
  id: string;
  contactId: string;
  timestamp: ISO8601;
  duration: number; // seconds
  type: 'incoming' | 'outgoing' | 'missed';
}
```

---

## 7. API & State Management

### 7.1 State Management (Redux-like)

```typescript
interface AppState {
  user: UserState;
  contacts: ContactsState;
  messages: MessagesState;
  mood: MoodState;
  ui: UIState;
}

interface UserState {
  profile: BigFiveProfile;
  tags: string[];
  settings: UserSettings;
}

interface ContactsState {
  byId: Record<string, Contact>;
  allIds: string[];
  filters: ContactFilter;
}

interface MoodState {
  entries: MoodEntry[];
  currentEntry: MoodEntry | null;
  streak: number;
}
```

### 7.2 Data Flow

```
User Action → Dispatch(Action) → Middleware → Reducer → New State → UI Update
                                  │
                                  ▼
                          Side Effects (API, Storage)
```

---

## 8. Security & Privacy

### 8.1 Data Handling

- **Local-first:** All data stored locally, never sent to external servers (except optional backup)
- **Encryption:** AES-256 for sensitive data at rest
- **Cloud backup:** Optional Google Drive sync (encrypted before upload)
- **Minimal permissions:** Request only what's needed

### 8.2 Google Drive Backup

```typescript
interface GoogleDriveBackup {
  // Enable/disable cloud backup
  enableBackup(): Promise<void>;
  disableBackup(): Promise<void>;
  
  // Manual backup trigger
  uploadBackup(): Promise<BackupResult>;
  
  // Restore from cloud
  downloadBackup(): Promise<RestoreResult>;
  
  // Sync status
  getLastSyncTime(): Promise<Date | null>;
  getBackupStatus(): Promise<BackupStatus>;
}
```

**Backup Implementation:**
- Use Google Drive API via `@react-native-google-signin/google-signin`
- Encrypt all data with user-derived key before upload
- Backup includes: profiles, messages, mood entries, settings
- Manual and automatic sync options (daily/weekly)
- User can view/manage backup in Google Drive "Shared with me"

### 8.3 Privacy Features

- **On-device processing:** All ML/analysis runs locally
- **Data export:** User can export/delete all data
- **Incognito mode:** Pause analysis temporarily
- **Contact anonymization:** Optional
- **Backup encryption:** Client-side AES-256 before cloud upload

---

## 9. Implementation Roadmap

### Phase 1: MVP - Android (Weeks 1-4)
- [ ] Core UI skeleton with navigation (Android)
- [ ] Local storage with Markdown profiles
- [ ] Manual contact entry
- [ ] Basic mood tracking
- [ ] Sample message data for testing
- [ ] Basic "Ask GCP" interface

### Phase 2: Message Loader - Android (Weeks 5-8)
- [ ] Android NotificationListenerService integration
- [ ] Android AccessibilityService for deep capture
- [ ] Platform connector interfaces (SMS, WhatsApp, Discord, Telegram)
- [ ] Message parser and normalizer
- [ ] Profile merger logic
- [ ] Initial sync flow

### Phase 3: Analysis Engine (Weeks 9-12)
- [ ] Big Five trait extraction
- [ ] Scoring algorithm implementation
- [ ] Comparison and bridging tips
- [ ] Insight generation
- [ ] Contact detail analytics

### Phase 4: Background Service + Cloud (Weeks 13-16)
- [ ] Android WorkManager for periodic sync
- [ ] Real-time message detection
- [ ] Battery optimization
- [ ] Google Drive backup integration
- [ ] Restore from backup

### Phase 5: Polish (Weeks 17-20)
- [ ] UI refinement
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Beta testing (Android)

### Phase 6: iOS Expansion (Weeks 21+)
- [ ] iOS implementation
- [ ] Notification Service Extension
- [ ] Cross-platform sync

---

## 10. Technical Stack

| Component | Technology | Priority |
|-----------|------------|----------|
| Framework | React Native (Expo with prebuild for native modules) | Phase 1 |
| State | Zustand | ✅ |
| Storage | AsyncStorage + File System (.md files for profiles) | ✅ |
| Cloud Backup | Google Drive API | ✅ |
| Charts | react-native-chart-kit | ✅ |
| Navigation | React Navigation v6 | ✅ |
| Background | WorkManager (Android) | ✅ |
| Encryption | react-native-keychain | ✅ |
| Push Notifications | Notifee | ✅ |
| Native Message Scanner | Android Accessibility Services | Phase 1 |

### 10.1 Native Message Scanner Architecture (Android-First)

The native message scanner bridges React Native to Android APIs for deep message access. iOS support deferred to Phase 2.

**Android - Primary Implementation:**

1. **NotificationListenerService** - Real-time notification capture
2. **AccessibilityService** - Deep UI extraction for apps that don't post notifications
3. **ContentResolver** - Direct SMS/MMS database access

```kotlin
// NotificationListenerService for real-time capture
class GcpMessageService : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val package = sbn?.packageName
        val message = extractMessageFromNotification(sbn)
        processMessage(message, getPlatformType(package))
    }
}

// AccessibilityService for UI-based capture
class GcpAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (isMessagingApp(event?.packageName)) {
            val messages = extractMessagesFromNode(event)
            pushToProcessingQueue(messages)
        }
    }
}
```

**iOS - Deferred to Phase 2:**
- Requires Notification Service Extension
- Limited by iOS sandboxing
- Will be implemented after Android stability

---

## 11. File Naming Convention

- Profiles: `{contact-uuid}.md`
- Conversations: `{conversation-uuid}.json`
- Mood entries: `entries.json` (array)
- Settings: `config.json`
- Insights: `cache.json`

---

## 12. Success Metrics

- **Engagement:** Daily active users, session length
- **Retention:** 7-day, 30-day retention rates
- **Insights:** Percentage of users who read generated tips
- **Accuracy:** User satisfaction with personality profiles (survey)
- **Performance:** App launch time < 2s, analysis time < 30s for 1000 messages

---

## 13. Subscription Tiers

The app is structured into three tiers, enabling a clear monetization path while providing immediate value to free users.

### 13.1 Tier Overview

| Feature | Free | Pro Profile | Business Pro |
|---------|------|-------------|--------------|
| **Price** | $0 | $4.99/month | $14.99/month |
| **Unified Inbox** | ✅ | ✅ | ✅ |
| **AI Assistant** | ✅ (Basic) | ✅ (Advanced) | ✅ (Advanced) |
| **Basic Contacts** | ✅ | ✅ | ✅ |
| **Mood Tracking** | ✅ | ✅ | ✅ |
| **Deep Big Five (30 traits)** | Limited (5 dimensions only) | ✅ Full | ✅ Full |
| **Contact Comparison** | - | ✅ | ✅ |
| **Compatibility Scores** | - | ✅ | ✅ |
| **Trends & Insights** | - | ✅ (30 days) | ✅ (90 days) |
| **Multi-Account** | - | - | ✅ |
| **CRM Dashboard** | - | - | ✅ |
| **Analytics Dashboard** | - | - | ✅ |
| **Auto-Replies** | - | - | ✅ |
| **Campaigns** | - | - | ✅ |
| **Priority Support** | - | - | ✅ |

### 13.2 Free Tier

**Target Users:** Individual users who want unified messaging and basic personality insights.

**Core Features:**
- **Unified Inbox:** Aggregate SMS, RCS, and major social platforms into one view
- **AI Assistant (P.U.L.S.E):**
  - Read & summarize messages
  - Snooze notifications for later
  - Basic tone detection
- **Basic Contacts:** Contact list with simple tags and relationship indicators
- **Mood Tracking:** Daily mood logging with basic calendar view and streak tracking
- **Big Five (Limited):** OCEAN dimensions only (5 scores), no sub-traits

**Limitations:**
- Basic OCEAN scores (no 30-trait breakdown)
- No contact comparison
- No compatibility scores
- Limited message history (30 days)
- No trend analysis
- Ad-supported (optional)

### 13.3 Pro Profile Tier ($4.99/month)

**Target Users:** Individuals seeking deep personality insights, relationship compatibility, and personal growth.

**Core Features:**
- Everything in Free, plus:
- **Deep Big Five (30 traits):** Full OCEAN model with 6 sub-traits per dimension
  - Openness: Imagination, Artistic Interests, Emotionality, Adventurousness, Intellect, Liberalism
  - Conscientiousness: Self-Discipline, Orderliness, Dutifulness, Achievement-Striving, Self-Efficacy, Cautiousness
  - Extroversion: Gregariousness, Assertiveness, Activity-Level, Excitement-Seeking, Cheerfulness, Positive-Emotion
  - Agreeableness: Trust, Straightforwardness, Altruism, Compliance, Modesty, Tender-Mindedness
  - Neuroticism: Anxiety, Angry-Hostility, Depression, Self-Consciousness, Impulsiveness, Vulnerability
- **Contact Comparison:** Side-by-side profile comparison with any contact
- **Compatibility Scores:** Relationship compatibility percentage with reasoning
- **Trends (30/60/90 days):** Historical profile evolution and interaction patterns
- **Advanced AI:** Deeper message analysis, personality predictions, communication tips

**Pricing Implementation:**
- Store-based subscription (Google Play / App Store)
- 7-day free trial
- Annual discount: $39.99/year (33% savings)

### 13.4 Business Pro Tier ($14.99/month)

**Target Users:** Sales professionals, account managers, recruiters, consultants who manage multiple client relationships.

**Core Features:**
- Everything in Pro Profile, plus:
- **Multi-Account:** Support for multiple messaging accounts (personal + business numbers)
- **CRM Dashboard:** Client relationship management with tags, notes, and pipeline stages
- **Analytics Dashboard:**
  - Response time metrics
  - Engagement scoring
  - Top performers / at-risk relationships
  - Team analytics (if multi-user)
- **Auto-Replies:** AI-powered automatic responses based on context and user preferences
- **Campaigns:** Bulk messaging with personalization placeholders
- **Export:** CSV/Excel exports for reporting
- **Priority Support:** Dedicated support channel

**Pricing Implementation:**
- Store-based subscription
- 14-day free trial
- Annual discount: $119.99/year (33% savings)
- Team plans available (custom pricing)

---

## 14. Key Screens by Tier

### 14.1 Free Tier Screens

#### 14.1.1 Unified Inbox

**Purpose:** Central hub for all incoming messages across platforms.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ 🔍 Search all messages...              🔔  │
├─────────────────────────────────────────────┤
│ [All] [SMS] [WhatsApp] [Discord] [Telegram] │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 Sarah Chen                           │ │
│ │ "Hey! Are we still on for lunch?"      │ │
│ │ 12:34 PM · WhatsApp              ▶     │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 Mike Torres                          │ │
│ │ "Check out this link..."               │ │
│ │ 11:20 AM · SMS                   ▶     │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 Discord: #general                    │ │
│ │ "Meeting moved to 3pm"                 │ │
│ │ 10:15 AM · Discord               ▶     │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ 📊   👥   🧠   📝   ⚙️                      │
└─────────────────────────────────────────────┘
```

**Features:**
- Platform filtering tabs
- Message search (content + sender)
- Swipe actions: Archive, Snooze, Delete
- Unread indicator badges
- Pull-to-refresh

#### 14.1.2 Conversations Screen

**Purpose:** Full message thread view with AI assistance.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  Sarah Chen                    🎤  ⋮     │
├─────────────────────────────────────────────┤
│                                      │
│   ┌─────────────────────────────────────┐ │
│   │  "Hey! How's the project going?"    │ │
│   │                              10:30 AM│ │
│   └─────────────────────────────────────┘ │
│                                       │
│   ┌─────────────────────────────────────┐ │
│   │  "Going well! Just finished the     │ │
│   │   first draft. Want to review?"     │ │
│   │                        10:32 AM  ✓✓ │ │
│   └─────────────────────────────────────┘ │
│                                       │
│   ┌─────────────────────────────────────┐ │
│   │  "Definitely! Send it over"         │ │
│   │                              10:35 AM│ │
│   └─────────────────────────────────────┘ │
│                                       │
├─────────────────────────────────────────────┤
│  ┌────────────────────────────────────┐   │
│  │ Type a message...                   │   │
│  └────────────────────────────────────┘   │
│                            📎 🎤 😊 ➤   │
└─────────────────────────────────────────────┘
```

**Features:**
- Full conversation history
- Timestamp and read receipts
- Platform indicator
- AI Panel toggle (bottom drawer)

#### 14.1.3 AI Panel (Free)

**Purpose:** Quick AI assistance within conversation.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ─────  AI Assistant (P.U.L.S.E)   ─────    │
├─────────────────────────────────────────────┤
│ 💡 Sarah seems in a good mood today         │
│                                             │
│ Suggested Response:                         │
│ "Looking forward to it! 🎉"                 │
│                                             │
│ [Insert] [Edit] [Dismiss]                   │
├─────────────────────────────────────────────┤
│ ⏰ Snooze this conversation...              │
│ [1hr] [3hr] [Tomorrow] [Custom]            │
└─────────────────────────────────────────────┘
```

**Features (Free):**
- Basic tone detection
- 3 suggested responses
- Snooze (1hr, 3hr, Tomorrow)
- Quick replies

#### 14.1.4 Contacts Screen (Free)

**Purpose:** Contact list with basic relationship info.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Contacts                 🔍 +              │
├─────────────────────────────────────────────┤
│ [All] [Close] [Family] [Work]              │
├─────────────────────────────────────────────┤
│ ⭐ Sarah Chen              💬 142   🟢 78  │
│    "Last: Yesterday"                       │
│                                             │
│ 👤 Mike Torres               💬 89    🟡 65 │
│    "Last: 2 days ago"                      │
│                                             │
│ 👤 Jordan Lee               💬 234   🟢 82  │
│    "Last: 3 hours ago"                     │
│                                             │
│ 👤 Alex Kim                  💬 12    🔴 41 │
│    "Last: 1 week ago"                      │
└─────────────────────────────────────────────┘
```

**Features:**
- Relationship score badges (🟢🟡🔴)
- Message count
- Last contact time
- Quick filter chips

#### 14.1.5 Settings Screen (Free)

**Purpose:** App configuration and account management.

**Sections:**
- Profile (name, avatar)
- Notifications (quiet hours, sounds)
- Backup (manual Google Drive sync)
- Data (export, clear)
- Subscription (upgrade prompt)
- About

---

### 14.2 Pro Profile Tier Screens

#### 14.2.1 My Profile Screen

**Purpose:** Deep dive into user's own Big Five personality.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  My Profile              📊 📥          │
├─────────────────────────────────────────────┤
│         👤 You (Pro Member)                │
│         Updated: Today                      │
├─────────────────────────────────────────────┤
│                                             │
│         ░░░░░░░░░░░░░░░░░░░░              │
│       ░░░ Openness      72  ░░             │
│                                             │
│         ░░░░░░░░░░░░░░░░░░░░              │
│       ░░░ Conscientious  68  ░░            │
│                                             │
│         ░░░░░░░░░░░░░░░░░░░░              │
│       ░░░ Extroversion    58  ░░           │
│                                             │
│         ░░░░░░░░░░░░░░░░░░░░              │
│       ░░░ Agreeableness  75  ░░            │
│                                             │
│         ░░░░░░░░░░░░░░░░░░░░              │
│       ░░░ Neuroticism    45  ░░            │
│                                             │
├─────────────────────────────────────────────┤
│ [View 30 Traits] [Comparison] [Insights]   │
└─────────────────────────────────────────────┘
```

**Features:**
- Animated radar chart
- Expandable trait sections
- Confidence indicator
- Trait explanations (tooltips)

#### 14.2.2 Contact Deep Dive Screen

**Purpose:** Comprehensive analytics for individual contacts.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  Sarah Chen                 📊 📝       │
├─────────────────────────────────────────────┤
│        👤 Sarah Chen                        │
│        📱 +1 555-0123                       │
│        💬 Last: 2 hours ago                 │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │      OCEAN Profile                      │ │
│ │      ▓▓▓▓▓▓░░ 72 Openness               │ │
│ │      ▓▓▓▓▓░░░ 65 Conscientiousness      │ │
│ │      ▓▓▓▓▓▓▓ 78 Extroversion            │ │
│ │      ▓▓▓▓▓░░░ 71 Agreeableness          │ │
│ │      ░░░░░░░░ 38 Neuroticism            │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Communication Style                         │
│ • Prefers: Casual, emoji-rich               │
│ • Response: Quick (< 30 min)                │
│ • Initiation: 60% you / 40% them            │
├─────────────────────────────────────────────┤
│ 💡 Bridge Tip: They value directness.       │
│    Consider being more straightforward.    │
├─────────────────────────────────────────────┤
│ [Messages] [Calls] [Compare] [Trends]       │
└─────────────────────────────────────────────┘
```

**Features:**
- Full OCEAN with 30 traits (tap to expand)
- Communication style analysis
- Bridge tips
- Message history timeline

#### 14.2.3 Comparison Screen

**Purpose:** Side-by-side personality comparison with contact.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  Compare Profiles                         │
├─────────────────────────────────────────────┤
│        You          vs        Sarah         │
│         72                    78            │
│    [Openness]              [Openness]      │
├─────────────────────────────────────────────┤
│ Compatibility Score: 82%                    │
│ ┌─────────────────────────────────────────┐ │
│ │ ████████████████████░░░░░░░░░░░         │ │
│ │ High Compatibility                      │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Dimension Differences:                      │
│ ┌─────────────────────────────────────────┐ │
│ │ Openness:      -6  (You slightly lower)│ │
│ │ Conscientious: -8  (You slightly lower)│ │
│ │ Extroversion: -20  ⚠️ Gap              │ │
│ │ Agreeableness: +4  (Similar)           │ │
│ │ Neuroticism:   +7  (Similar)           │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ 💡 Communication Tips:                     │
│ • They're more outgoing - match their      │
│   energy in group settings                  │
│ • They're more spontaneous - loosen up     │
│   with unplanned activities                │
└─────────────────────────────────────────────┘
```

**Features:**
- Animated dimension comparison
- Compatibility score with breakdown
- Specific gap warnings
- Actionable bridging tips

#### 14.2.4 Compatibility Screen

**Purpose:** Detailed relationship compatibility analysis.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  Compatibility: Sarah Chen               │
├─────────────────────────────────────────────┤
│              💜 82%                         │
│         Excellent Match                    │
├─────────────────────────────────────────────┤
│ Strengths:                                  │
│ ✓ Similar communication styles             │
│ ✓ Complementary energy levels              │
│ ✓ Balanced give-and-take                   │
├─────────────────────────────────────────────┤
│ Challenges:                                 │
│ ⚠ Their spontaneity may frustrate you     │
│ ⚠ Different social preferences            │
├─────────────────────────────────────────────┤
│ Historical Trend:                           │
│ ┌─────────────────────────────────────────┐ │
│ │    Jan  Feb  Mar  Apr  May  Jun         │ │
│ │    75   78   80   79   81   82          │ │
│ │    ▓▓  ▓▓▓  ▓▓▓  ▓▓▓  ▓▓▓  ▓▓▓         │ │
│ └─────────────────────────────────────────┘ │
│ Relationship improving over 6 months        │
├─────────────────────────────────────────────┤
│ [View Full Profile] [Trends] [Messages]     │
└─────────────────────────────────────────────┘
```

**Features:**
- Compatibility breakdown
- Strengths/challenges list
- Historical trend graph
- Improvement suggestions

#### 14.2.5 Trends Screen

**Purpose:** Historical analysis of profile and relationships.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  Trends & Insights              📅       │
├─────────────────────────────────────────────┤
│ [30 Days] [60 Days] [90 Days]              │
├─────────────────────────────────────────────┤
│ Your Profile Evolution                     │
│ ┌─────────────────────────────────────────┐ │
│ │ Openness  ▓▓▓▓▓▓░ 72→75 (+3)           │ │
│ │ Conscientious  ▓▓▓▓▓░ 68→67 (-1)       │ │
│ │ Extroversion  ▓▓▓▓▓▓ 58→61 (+3)        │ │
│ │ Agreeableness  ▓▓▓▓▓▓ 75→74 (-1)       │ │
│ │ Neuroticism  ▓▓▓▓░ 45→42 (-3) ✓        │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Top Relationships (by engagement)           │
│ 1. Sarah Chen    ████████████  142 msgs    │
│ 2. Mike Torres   █████████░░   89 msgs     │
│ 3. Jordan Lee    ████████░░░   67 msgs     │
├─────────────────────────────────────────────┤
│ Mood Trend                                  │
│  ┌──────────────────────────────────────┐  │
│  │      /\_/\                           │  │
│  │     ( o.o )  Avg: 7.2 (+0.5)        │  │
│  │      > ^ <                           │  │
│  └──────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│ Key Insight: You're becoming more          │
│ outgoing and less anxious. Great progress! │
└─────────────────────────────────────────────┘
```

**Features:**
- OCEAN dimension trends
- Relationship engagement rankings
- Mood tracking graph
- AI-generated insights

---

### 14.3 Business Pro Tier Screens

#### 14.3.1 Multi-Account Screen

**Purpose:** Manage multiple messaging accounts.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  Accounts                       + Add    │
├─────────────────────────────────────────────┤
│ Active Account                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 📱 +1 555-0100 (Personal)      ●       │ │
│ │ ● Using now                               │ │
│ │ Last active: Just now                    │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Linked Accounts                            │
│ ┌─────────────────────────────────────────┐ │
│ │ 📱 +1 555-0200 (Business)       ○      │ │
│ │ Switch                                  │ │
│ │ Last active: 2 hours ago                │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 📱 +1 555-0300 (Work)           ○      │ │
│ │ Switch                                  │ │
│ │ Last active: Yesterday                  │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Account Settings:                           │
│ • Separate profiles per account             │
│ • Cross-account search                      │
│ • Unified notifications                     │
└─────────────────────────────────────────────┘
```

**Features:**
- Quick account switching
- Separate contact databases
- Cross-account search
- Per-account notifications

#### 14.3.2 CRM Dashboard

**Purpose:** Client relationship management for business users.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  CRM Dashboard               📊 🔍      │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Pipeline Overview                       │ │
│ │                                         │ │
│ │ 🟢 Hot: 5    🟡 Warm: 12   🔴 Cold: 8   │ │
│ │                                         │ │
│ │ [Lead] ████████░░ 40%                   │ │
│ │ [Prospect] ████████████░░ 55%           │ │
│ │ [Close] ██████████████ 78%              │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Today's Follow-ups                          │
│ ┌─────────────────────────────────────────┐ │
│ │ 🔴 Sarah Chen - No contact in 5 days   │ │
│ │ 🟡 Mike Torres - Proposal due today     │ │
│ │ 🟢 Jordan Lee - Meeting scheduled       │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Recent Activity                             │
│ ┌─────────────────────────────────────────┐ │
│ │ • Sarah Chen: New message received      │ │
│ │ • Client X: Proposal viewed             │ │
│ │ • Mike Torres: Meeting accepted         │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Quick Actions                               │
│ [New Contact] [Campaign] [Export] [Report] │
└─────────────────────────────────────────────┘
```

**Features:**
- Pipeline visualization
- Follow-up reminders
- Activity feed
- Quick actions
- Deal stage tracking

#### 14.3.3 Analytics Dashboard

**Purpose:** Comprehensive analytics for business metrics.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  Analytics                   📅          │
├─────────────────────────────────────────────┤
│ [Week] [Month] [Quarter] [Year]            │
├─────────────────────────────────────────────┤
│ Key Metrics                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ Total Contacts        247        +12%  │ │
│ │ Active Conversations   89        +8%   │ │
│ │ Avg Response Time      2.3h      -15%  │ │
│ │ Response Rate         94%        +3%   │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Engagement Over Time                        │
│ ┌─────────────────────────────────────────┐ │
│ │    ▓▓▓▓                                  │ │
│ │  ▓▓▓▓▓▓▓▓                               │ │
│ │▓▓▓▓▓▓▓▓▓▓▓▓                             │ │
│ │ Jan  Feb  Mar  Apr  May  Jun            │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Top Performers                              │
│ 1. Sarah Chen - 98 engagement score       │
│ 2. Mike Torres - 95 engagement score      │
│ 3. Jordan Lee - 92 engagement score       │
├─────────────────────────────────────────────┤
│ At-Risk Relationships                       │
│ ⚠️ Alex Kim - No contact in 14 days       │
│ ⚠️ Taylor Swift - Declining engagement    │
└─────────────────────────────────────────────┘
```

**Features:**
- Custom date ranges
- Export to CSV/PDF
- Comparison periods
- Engagement scoring

#### 14.3.4 Templates Screen

**Purpose:** Create and manage message templates for quick responses.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  Templates                     + New     │
├─────────────────────────────────────────────┤
│ [All] [Sales] [Support] [Follow-up]        │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 📝 Initial Outreach                     │ │
│ │ "Hi {{name}}, thanks for connecting!   │ │
│ │  I'd love to learn more about..."       │ │
│ │ Used: 45 times                          │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 📝 Follow-up                            │ │
│ │ "Hi {{name}}, just checking in on..."   │ │
│ │ Used: 32 times                          │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 📝 Meeting Request                      │ │
│ │ "Hi {{name}}, would you have 15 min..." │ │
│ │ Used: 28 times                          │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Template Variables:                         │
│ {{name}} {{company}} {{meeting_time}}      │
│ {{product}} {{next_step}}                  │
└─────────────────────────────────────────────┘
```

**Features:**
- Template categories
- Variable placeholders
- Usage statistics
- Quick insert in compose

#### 14.3.5 Campaigns Screen

**Purpose:** Create and manage bulk messaging campaigns.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ←  Campaigns                    + New     │
├─────────────────────────────────────────────┤
│ Active Campaigns                            │
│ ┌─────────────────────────────────────────┐ │
│ │ 📣 Q1 Product Launch                    │ │
│ │ Status: Sending                         │ │
│ │ Progress: ████████████░░ 156/200       │ │
│ │ Sent: 9:00 AM · Completes: 9:15 AM     │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Scheduled                                   │
│ ┌─────────────────────────────────────────┐ │
│ │ 📣 Valentine's Day Promo     📅 Feb 14 │ │
│ │ Audience: 150 contacts                  │ │
│ │ Scheduled: 9:00 AM                      │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Past Campaigns                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 📣 Holiday Sale 2024         ✅ 98%    │ │
│ │ Sent to 189 · 185 delivered            │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 📣 New Feature Announcement ✅ 100%    │ │
│ │ Sent to 247 · 247 delivered            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Features:**
- Campaign builder with template
- Audience selection (filters, tags)
- Scheduling
- Delivery tracking
- A/B testing

---

## 15. Feature Gating Implementation

### 15.1 Tier Enforcement

```typescript
interface TierFeatures {
  // Free
  unifiedInbox: boolean;
  aiAssistantBasic: boolean;
  basicContacts: boolean;
  moodTracking: boolean;
  oceanBasic: boolean; // 5 dimensions only
  
  // Pro Profile
  deepBigFive: boolean; // 30 traits
  contactComparison: boolean;
  compatibilityScores: boolean;
  trends30_60_90: boolean;
  aiAssistantAdvanced: boolean;
  
  // Business Pro
  multiAccount: boolean;
  crmDashboard: boolean;
  analyticsDashboard: boolean;
  autoReplies: boolean;
  campaigns: boolean;
  export: boolean;
}

const tierGating = {
  free: {
    unifiedInbox: true,
    aiAssistantBasic: true,
    basicContacts: true,
    moodTracking: true,
    oceanBasic: true,
    deepBigFive: false,
    contactComparison: false,
    compatibilityScores: false,
    trends30_60_90: false,
    aiAssistantAdvanced: false,
    multiAccount: false,
    crmDashboard: false,
    analyticsDashboard: false,
    autoReplies: false,
    campaigns: false,
    export: false,
  },
  pro: {
    // All free features
    unifiedInbox: true,
    aiAssistantBasic: true,
    basicContacts: true,
    moodTracking: true,
    oceanBasic: true,
    // Pro features
    deepBigFive: true,
    contactComparison: true,
    compatibilityScores: true,
    trends30_60_90: true,
    aiAssistantAdvanced: true,
    // Business Pro features disabled
    multiAccount: false,
    crmDashboard: false,
    analyticsDashboard: false,
    autoReplies: false,
    campaigns: false,
    export: false,
  },
  businessPro: {
    // All features enabled
    unifiedInbox: true,
    aiAssistantBasic: true,
    basicContacts: true,
    moodTracking: true,
    oceanBasic: true,
    deepBigFive: true,
    contactComparison: true,
    compatibilityScores: true,
    trends30_60_90: true,
    aiAssistantAdvanced: true,
    multiAccount: true,
    crmDashboard: true,
    analyticsDashboard: true,
    autoReplies: true,
    campaigns: true,
    export: true,
  },
};
```

### 15.2 Screen Navigation Guard

```typescript
const tierGatedScreens = {
  // Pro Profile screens
  'MyProfile': { tier: 'pro', fallback: 'free_my_profile' },
  'ContactDeepDive': { tier: 'pro', fallback: 'free_contact_detail' },
  'Comparison': { tier: 'pro', fallback: 'free_comparison_prompt' },
  'Compatibility': { tier: 'pro', fallback: 'free_compatibility_prompt' },
  'Trends': { tier: 'pro', fallback: 'free_trends_prompt' },
  
  // Business Pro screens
  'MultiAccount': { tier: 'businessPro', fallback: 'upgrade_prompt' },
  'CRMDashboard': { tier: 'businessPro', fallback: 'upgrade_prompt' },
  'Analytics': { tier: 'businessPro', fallback: 'upgrade_prompt' },
  'Templates': { tier: 'businessPro', fallback: 'upgrade_prompt' },
  'Campaigns': { tier: 'businessPro', fallback: 'upgrade_prompt' },
};

function canAccessScreen(screen: string, userTier: string): boolean {
  const requiredTier = tierGatedScreens[screen]?.tier;
  if (!requiredTier) return true;
  
  const tierHierarchy = ['free', 'pro', 'businessPro'];
  return tierHierarchy.indexOf(userTier) >= tierHierarchy.indexOf(requiredTier);
}
```

### 15.3 Upgrade Prompt Component

```typescript
function UpgradePrompt({ feature, currentTier, onUpgrade }) {
  return (
    <Modal>
      <Card>
        <Icon name="lock" size={48} color="gold" />
        <Title>Unlock {feature}</Title>
        <Description>
          This feature is available on {currentTier === 'free' ? 'Pro Profile' : 'Business Pro'} tier.
        </Description>
        <Pricing>
          {currentTier === 'free' 
            ? '$4.99/month' 
            : '$14.99/month'}
        </Pricing>
        <Button onPress={onUpgrade}>Upgrade Now</Button>
        <TextButton>Maybe Later</TextButton>
      </Card>
    </Modal>
  );
}
```

---

## 16. Technical Implementation Notes

### 16.1 React Native Architecture (Tier-Aware)

```typescript
// App.tsx - Tier-based feature routing
function App() {
  const { tier, features } = useSubscription();
  
  return (
    <NavigationContainer>
      <Tab.Navigator>
        {/* Always available */}
        <Tab.Screen name="Inbox" component={UnifiedInbox} />
        <Tab.Screen name="Contacts" component={ContactsStack} />
        
        {/* Tier-gated */}
        {features.deepBigFive && (
          <Tab.Screen name="MyProfile" component={MyProfileScreen} />
        )}
        
        {features.crmDashboard && (
          <Tab.Screen name="CRM" component={CRMDashboard} />
        )}
        
        {/* Always available */}
        <Tab.Screen name="Journal" component={JournalScreen} />
        <Tab.Screen name="Settings" component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### 16.2 Data Schema for Business Pro

```typescript
// CRM Contact extension
interface CRMContact extends Contact {
  pipelineStage: 'lead' | 'prospect' | 'negotiation' | 'close' | 'closed_won' | 'closed_lost';
  dealValue?: number;
  lastContactDate: ISO8601;
  nextFollowUp?: ISO8601;
  tags: string[];
  notes: CRMNote[];
  activityLog: Activity[];
}

// Campaign schema
interface Campaign {
  id: string;
  name: string;
  templateId: string;
  audienceFilters: ContactFilter[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  scheduledAt?: ISO8601;
  startedAt?: ISO8601;
  completedAt?: ISO8601;
  totalRecipients: number;
  deliveredCount: number;
  openedCount: number;
  repliedCount: number;
}

// Auto-reply rules
interface AutoReplyRule {
  id: string;
  name: string;
  triggerKeywords: string[];
  responseTemplate: string;
  platform: Platform[];
  enabled: boolean;
  replyDelay: number; // seconds
}
```

---

## 17. Monetization Summary

| Tier | Price | Target | Key Value Prop |
|------|-------|--------|----------------|
| Free | $0 | Everyone | Unified inbox + basic AI |
| Pro Profile | $4.99/mo | Personal users | Deep personality insights |
| Business Pro | $14.99/mo | Professionals | CRM + automation |

**Revenue Streams:**
1. Subscription fees (primary)
2. Annual plan discounts
3. Potential: Sponsored insights (opt-in, non-intrusive)
4. Potential: API access for Business Pro teams

---

*SPEC.md - P.U.L.S.E v2.0 - Expanded with Tier System*
