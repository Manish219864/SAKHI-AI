# SAKHI - Requirements Document
## National Women's Safety Interoperability Grid

---

## 1. Introduction

### 1.1 Project Name
**SAKHI** - National Women's Safety Interoperability Grid  
*Sakhi (सखी) means "friend" or "companion" in Hindi*

### 1.2 Purpose
SAKHI is an AI-powered national platform that unifies India's 28+ fragmented state women safety applications into a single interoperable grid. The system provides seamless cross-state emergency response, predictive safety intelligence, and inclusive access for both smartphone and feature phone users.

### 1.3 Problem Statement

**The Crisis:**
- A woman faces violence every 16 minutes in India (NCRB 2023)
- 28+ state safety apps operate in complete isolation
- Zero interoperability when women cross state boundaries
- 600M+ feature phone users completely excluded from digital safety
- Reactive "call police" approach fails to prevent incidents
- Critical minutes lost in fragmented emergency response

**The Gap:**
- Woman registered in Kerala's app has no protection in Delhi
- Police in one state cannot access safety profiles from another
- No national visibility into safety patterns or high-risk zones
- Feature phone users (majority rural women) have no digital safety access
- Evidence collection happens after incidents, not during
- No predictive capability to prevent incidents before they occur

### 1.4 Target Audience

| User Category | Size | Primary Needs |
|---------------|------|---------------|
| **Women (Smartphone)** | 200M+ | Cross-state SOS, safe routes, evidence collection |
| **Women (Feature Phone)** | 300M+ | SMS/IVR-based SOS, missed call alerts |
| **Family Members** | 500M+ | Real-time alerts, location tracking, check-ins |
| **Police Stations** | 16,000+ | Instant SOS routing, auto-FIR, evidence access |
| **State Control Rooms** | 28 | Cross-state coordination, incident tracking |
| **Ministry of Home Affairs** | 1 | National heatmap, policy insights, resource allocation |
| **State App Developers** | 28+ teams | Quick SDK integration, API access |
| **NGO/Volunteers** | 10,000+ orgs | Community response, on-ground support |

---

## 2. Goals and Objectives

### 2.1 Vision Statement
*"Every woman in India, regardless of location or device, has instant access to a unified national safety network that predicts, prevents, and responds to threats in real-time."*

### 2.2 Primary Goal
Build a national interoperability layer connecting all 28+ state women safety apps into one intelligent grid, accessible via smartphone, feature phone, SMS, voice, and web.

### 2.3 Strategic Objectives

| # | Objective | Description | Success Metric | Timeline |
|---|-----------|-------------|----------------|----------|
| **O1** | **Unified Identity** | Single Sakhi ID works across all states | 100% state coverage | Year 1 |
| **O2** | **Cross-State SOS** | Emergency relay across boundaries | <200ms response | Month 3 |
| **O3** | **Digital Inclusion** | Feature phone full support | 50M feature phone users | Year 1 |
| **O4** | **Predictive Safety** | AI prevents incidents before they occur | 30% incident reduction | Year 2 |
| **O5** | **Rapid Response** | Auto-FIR with evidence | <5min FIR generation | Month 6 |
| **O6** | **Silent Evidence** | Covert recording during threats | 100% encrypted | Month 3 |
| **O7** | **National Visibility** | Real-time safety intelligence | Daily policy insights | Month 6 |
| **O8** | **Vernacular Access** | 12+ languages, voice-first | 90% language coverage | Year 1 |

### 2.4 Key Results (OKRs)

**Year 1:**
- 10M registered users (5M smartphone + 5M feature phone)
- 20+ state apps integrated
- 100K+ SOS handled with <200ms response
- 50K+ auto-FIRs generated
- 30% reduction in response time vs legacy systems

**Year 2:**
- 50M registered users
- All 28 states + 8 UTs integrated
- 1M+ SOS handled
- 25% reduction in repeat incidents in covered areas
- National safety heatmap influencing policy in 15+ states

---

## 3. Functional Requirements

### FR-01: Unified Safety Profile (Sakhi ID)

**Feature ID**: FR-01  
**Category**: Core Identity  
**Priority**: P0 (Critical)

**Description**:  
A portable national safety identity that works seamlessly across all 28+ states. One registration, universal protection. The Sakhi ID eliminates the need for separate registrations in each state app and ensures emergency responders have instant access to critical user information regardless of location.

**User Story**:  
> **As a** woman traveling from Kerala to Delhi for work  
> **I want** a single safety profile that works in both states  
> **So that** I don't need to register separately and my emergency contacts work everywhere

**Detailed Requirements**:

1. **Registration**
   - Aadhaar-based verification (optional, privacy-preserving)
   - Mobile OTP verification (mandatory)
   - Biometric authentication support (fingerprint/face)
   - Under 3 minutes to complete registration

2. **Profile Data**
   - Personal: Name, photo, age, languages spoken
   - Emergency contacts: Up to 10 trusted circle members
   - Medical: Blood type, allergies, medications, chronic conditions
   - Preferences: Language, notification settings
   - Home state and current location

3. **Synchronization**
   - Real-time sync across all state apps (<30 seconds)
   - Offline mode with last-synced data
   - Conflict resolution (latest update wins)
   - Version control for audit trail

4. **Privacy Controls**
   - User controls what data is shared with police
   - Temporary profile hiding option
   - Data deletion request (right to be forgotten)
   - Consent management for data sharing

**Acceptance Criteria**:
- [ ] User can register with mobile number in <3 minutes
- [ ] Sakhi ID works in all integrated state apps
- [ ] Profile updates sync within 30 seconds
- [ ] Emergency contacts accessible from any state
- [ ] Medical info encrypted and accessible only during SOS
- [ ] Works offline with cached data
- [ ] User can update profile from any state app
- [ ] Profile deletion completes within 24 hours

**Technical Specifications**:
- Unique ID format: SAKHI-[STATE-CODE]-[10-DIGIT-NUMBER]
- Example: SAKHI-KL-1234567890
- Database: DynamoDB with global tables
- Encryption: AES-256 for PII
- API: RESTful with OAuth 2.0

**Dependencies**: Aadhaar API (optional), SMS gateway, state app APIs

**Risks**: 
- Aadhaar integration delays
- State resistance to data sharing
- Privacy concerns from users

**Mitigation**:
- Make Aadhaar optional, mobile mandatory
- Data stays encrypted, states get access only during SOS
- Transparent privacy policy and user controls

---

### FR-02: Cross-State SOS Relay

**Feature ID**: FR-02  
**Category**: Emergency Response  
**Priority**: P0 (Critical)

**Description**:  
Intelligent emergency routing that sends SOS to the correct jurisdiction based on current location, not registration state. A woman from Kerala gets instant help in Delhi. The system handles cross-state coordination automatically, notifying both current and home state authorities while alerting trusted contacts.

**User Story**:  
> **As a** woman from Kerala traveling in Delhi  
> **I want** my SOS to reach Delhi police instantly  
> **So that** I get help where I am, not where I'm registered

**Detailed Requirements**:

1. **SOS Trigger Methods**
   - Single tap on panic button (smartphone)
   - Power button 3x press (Android)
   - Volume button 5x press (iOS)
   - Voice command: "Sakhi, help me" (12 languages)
   - Missed call to toll-free number (feature phone)
   - SMS "HELP" to short code (feature phone)
   - Shake phone vigorously (configurable)

2. **Location Detection**
   - Primary: GPS (accuracy <50m)
   - Fallback: Cell tower triangulation (<500m)
   - Tertiary: Last known location
   - IP-based location (web app)
   - Manual location entry option

3. **Routing Logic**
   - Detect current location in <100ms
   - Identify jurisdiction (state, district, police station)
   - Route to nearest police station within 200ms
   - Notify home state control room
   - Alert current state control room
   - Send to trusted circle (SMS + push + call)
   - Escalate to state police if no response in 5 min

4. **Alert Content**
   - User profile (name, photo, Sakhi ID)
   - Precise location (lat/long + address)
   - Timestamp
   - Medical information
   - Recent location history (last 2 hours)
   - Live location tracking link
   - One-tap navigation to location

5. **Confirmation & Tracking**
   - SMS confirmation to user within 5 seconds
   - Police acknowledgment tracking
   - Estimated time of arrival (ETA)
   - Live status updates to trusted circle
   - Incident ID for reference

**Acceptance Criteria**:
- [ ] SOS routes to correct police station in <200ms
- [ ] Works across all 28 states + 8 UTs
- [ ] Both home and current state notified
- [ ] Trusted circle receives alerts within 10 seconds
- [ ] SMS fallback works without internet
- [ ] Location accuracy <50m with GPS, <500m with cell tower
- [ ] User receives confirmation within 5 seconds
- [ ] SOS history accessible across states
- [ ] False alarm cancellation within 30 seconds
- [ ] Works in roaming (different telecom operator)

**Technical Specifications**:
- Geofencing: Polygon-based jurisdiction mapping
- Database: PostgreSQL with PostGIS extension
- Real-time: WebSocket for live tracking
- SMS: Twilio/AWS SNS with 99.9% delivery
- Push: FCM (Android), APNs (iOS)
- Voice call: Exotel/Knowlarity IVR

**Performance Requirements**:
- Location detection: <100ms
- Routing decision: <100ms
- Police notification: <200ms total
- Trusted circle alert: <10 seconds
- SMS delivery: <5 seconds
- Concurrent SOS: 10,000/second capacity

**Dependencies**: GPS, cell tower data, police station database, SMS gateway, push notification service

**Edge Cases**:
- User on state border (alert both states)
- User in moving vehicle (continuous location updates)
- GPS unavailable (use cell tower)
- No internet (SMS-only mode)
- User unconscious (auto-escalate after 5 min)

**Risks**:
- False positives overwhelming police
- Location inaccuracy in rural areas
- Network congestion during mass events

**Mitigation**:
- 30-second cancellation window
- Cell tower fallback for rural areas
- Priority queue for SOS messages

---

### FR-03: Feature Phone Support (Digital Inclusion)

**Feature ID**: FR-03  
**Category**: Accessibility  
**Priority**: P0 (Critical)

**Description**:  
Complete safety features for 600M+ feature phone users via missed call, SMS, USSD, and IVR. No smartphone or internet required. This is the most critical inclusion feature, ensuring rural and economically disadvantaged women have equal access to national safety infrastructure.

**User Story**:  
> **As a** woman in a village with only a basic phone  
> **I want** to trigger SOS with a missed call  
> **So that** I can get help without internet, smartphone, or even balance

**Detailed Requirements**:

1. **Missed Call SOS**
   - Toll-free number: 1800-XXX-XXXX
   - User gives missed call
   - System detects number, triggers SOS
   - Location via cell tower triangulation
   - SMS confirmation sent immediately
   - Works with zero balance

2. **SMS Commands**
   - `HELP` - Trigger SOS
   - `SAFE` - Cancel SOS / Mark safe
   - `LOCATION` - Share current location with trusted circle
   - `STATUS` - Get last SOS status
   - `REGISTER [NAME]` - Quick registration
   - `ADD [NUMBER]` - Add trusted contact
   - Short code: 56767 (SAKHI on keypad)
   - Works on 2G networks

3. **USSD Menu** (*#767#)
   ```
   1. Trigger SOS
   2. I'm Safe
   3. Share Location
   4. Add Contact
   5. Check Status
   6. Help (in regional language)
   ```

4. **IVR System**
   - Call toll-free number
   - Language selection (12 languages)
   - Voice menu navigation
   - Press 1 for SOS
   - Press 2 to add contact
   - Press 3 for status
   - Voice recording for evidence
   - Callback feature

5. **Language Support**
   - Hindi, English, Tamil, Telugu, Bengali
   - Marathi, Gujarati, Kannada, Malayalam
   - Punjabi, Odia, Assamese
   - Auto-detect based on circle/state
   - Voice prompts in selected language

6. **Registration via Feature Phone**
   - SMS: `REGISTER [NAME]`
   - IVR-guided registration
   - OTP verification
   - Add up to 5 contacts via SMS
   - No app installation needed

**Acceptance Criteria**:
- [ ] Missed call triggers SOS within 10 seconds
- [ ] SMS commands work on all operators
- [ ] USSD menu loads in <3 seconds
- [ ] IVR supports 12 languages
- [ ] Cell tower location accuracy <500m
- [ ] Works on 2G networks
- [ ] Zero balance operation
- [ ] SMS confirmation within 5 seconds
- [ ] Registration completes via SMS in <2 minutes
- [ ] Works during roaming

**Technical Specifications**:
- Telecom API: Integration with all major operators
- Cell tower data: OpenCelliD + operator APIs
- SMS gateway: Bulk SMS with 99.9% delivery
- IVR platform: Exotel/Knowlarity
- USSD gateway: Operator-specific integration
- Voice recording: 8kHz, compressed storage

**Network Requirements**:
- Minimum: 2G (GPRS)
- SMS delivery: <5 seconds
- USSD response: <3 seconds
- IVR call quality: Clear on 2G
- Works in low signal areas

**Cost Considerations**:
- Toll-free for users (government bears cost)
- SMS: ₹0.10 per message
- IVR: ₹0.50 per minute
- Estimated: ₹50 crore/year for 100M users

**Dependencies**: Telecom operator partnerships, DoT approval for toll-free number, TRAI compliance

**Edge Cases**:
- User has no balance (missed call works)
- User in roaming (SMS charges waived)
- Network congestion (priority routing)
- Wrong number calls (verification via OTP)

**Risks**:
- Telecom operator delays
- SMS delivery failures
- USSD not supported by all operators
- Spam/misuse of toll-free number

**Mitigation**:
- Multi-operator redundancy
- SMS retry mechanism (3 attempts)
- USSD fallback to IVR
- Rate limiting + OTP verification

---

### FR-04: Safe Route Predictor

**Feature ID**: FR-04  
**Category**: Predictive Safety  
**Priority**: P1 (High)

**Description**:  
AI-powered route recommendation engine that analyzes historical crime data, time of day, lighting conditions, and real-time safety scores to suggest the safest path between two points.

**User Story**:  
> **As a** woman planning my evening commute  
> **I want** to see the safest route with risk scores  
> **So that** I can avoid high-risk areas and reach home safely

**Detailed Requirements**:
- Integration with Google Maps/MapMyIndia
- Real-time safety score (0-100) for each route
- Historical crime data overlay (NCRB + state police)
- Time-of-day risk adjustment (night routes scored differently)
- Street lighting data integration
- Crowdsourced safety ratings from users
- Alternative route suggestions with comparative scores
- Works offline with cached data for frequent routes

**Acceptance Criteria**:
- [ ] Route safety score calculated in <2 seconds
- [ ] At least 3 alternative routes shown
- [ ] Historical crime data updated weekly
- [ ] Time-based risk factors applied
- [ ] User can report unsafe areas (crowdsourced)
- [ ] Offline mode works for saved routes
- [ ] Integration with navigation apps

**Technical Specifications**:
- ML Model: Random Forest for risk prediction
- Data sources: NCRB, state police APIs, OpenStreetMap
- Factors: Crime density, time, lighting, police presence, user reports
- Update frequency: Real-time for user reports, weekly for crime data

---

### FR-05: Vernacular Voice AI

**Feature ID**: FR-05  
**Category**: Accessibility  
**Priority**: P1 (High)

**Description**:  
Voice-activated SOS and navigation in 12+ Indian languages with dialect recognition. Hands-free operation for critical situations.

**User Story**:  
> **As a** woman who speaks only Tamil  
> **I want** to use voice commands in my language  
> **So that** I can access safety features quickly without typing

**Detailed Requirements**:
- Support for Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese
- Dialect recognition (e.g., Hyderabadi Hindi, Bambaiya Hindi)
- Voice SOS activation: "Sakhi, help me" / "सखी, मदद करो"
- Hands-free operation while driving/walking
- Background noise filtering
- <2s response time
- Works offline with on-device models

**Acceptance Criteria**:
- [ ] 12 languages supported
- [ ] Voice recognition accuracy >90%
- [ ] Works in noisy environments
- [ ] Response time <2 seconds
- [ ] Offline voice models available
- [ ] Dialect variations recognized

**Technical Specifications**:
- Speech-to-Text: Google Cloud Speech / Bhashini API
- On-device: TensorFlow Lite models
- Wake word: "Sakhi" detection
- Noise cancellation: WebRTC algorithms

---

### FR-06: Auto-FIR Generator

**Feature ID**: FR-06  
**Category**: Legal Compliance  
**Priority**: P0 (Critical)

**Description**:  
Automatic First Information Report generation with evidence attachment and police station routing. Eliminates paperwork delays and ensures legal process starts immediately.

**User Story**:  
> **As a** woman in distress  
> **I want** FIR filed automatically when I trigger SOS  
> **So that** legal process starts immediately without paperwork delays

**Detailed Requirements**:
- FIR generated within 5 minutes of SOS
- Auto-populated with user profile, location, timestamp
- Audio/video evidence attached automatically
- Routed to jurisdiction police station
- FIR number sent to user via SMS
- Compliant with CrPC Section 154
- Digital signature with timestamp
- Integration with state e-FIR systems

**Acceptance Criteria**:
- [ ] FIR generated in <5 minutes
- [ ] All evidence attached automatically
- [ ] FIR number sent to user
- [ ] Compliant with CrPC Section 154
- [ ] Integration with 20+ state e-FIR systems
- [ ] Digital signature applied
- [ ] Audit trail maintained

**Technical Specifications**:
- Template: CrPC Section 154 compliant
- Evidence: S3 links embedded in FIR
- Signature: Digital signature with timestamp
- Integration: REST APIs with state police systems

---

### FR-07: Silent Evidence Mode

**Feature ID**: FR-07  
**Category**: Evidence Collection  
**Priority**: P0 (Critical)

**Description**:  
Covert audio/video recording with secure cloud upload when user feels unsafe. No screen indication to avoid escalating danger.

**User Story**:  
> **As a** woman in a threatening situation  
> **I want** to record evidence silently  
> **So that** I have proof without escalating danger

**Detailed Requirements**:
- Activated via power button triple-press
- No screen indication of recording
- Auto-upload to encrypted cloud storage
- Continues recording even if app closed
- Battery-efficient background operation
- Evidence timestamped and geotagged
- Accessible only by user and authorized police
- Automatic deletion after 90 days (configurable)

**Acceptance Criteria**:
- [ ] Activated with power button 3x press
- [ ] No visible recording indicator
- [ ] Continues in background
- [ ] Auto-uploads to encrypted storage
- [ ] Battery drain <5% per hour
- [ ] Evidence geotagged and timestamped
- [ ] Only user and police can access

**Technical Specifications**:
- Recording: H.264 video, AAC audio
- Encryption: AES-256 before upload
- Storage: S3 with KMS encryption
- Background: Android Foreground Service / iOS Background Modes
- Battery: Optimized codec settings

---

### FR-08: National Safety Heatmap

**Feature ID**: FR-08  
**Category**: Analytics & Policy  
**Priority**: P2 (Medium)

**Description**:  
Real-time visualization of safety incidents across India for policy makers and public awareness. Enables data-driven resource allocation and targeted interventions.

**User Story**:  
> **As a** Ministry official  
> **I want** to see national safety trends on a heatmap  
> **So that** I can allocate resources and create targeted interventions

**Detailed Requirements**:
- Real-time incident visualization
- Heatmap by district/city/state
- Time-based filtering (hour/day/month/year)
- Incident type categorization
- Anonymous data aggregation (privacy-preserving)
- Public dashboard (anonymized, aggregated)
- Admin dashboard (detailed, role-based access)
- Export to CSV/PDF for reports

**Acceptance Criteria**:
- [ ] Real-time updates (<5 min delay)
- [ ] Drill-down from national to district level
- [ ] Time-based trend analysis
- [ ] Public dashboard with anonymized data
- [ ] Admin dashboard with detailed insights
- [ ] Export functionality
- [ ] Mobile-responsive design

**Technical Specifications**:
- Visualization: Mapbox GL / Leaflet
- Data aggregation: Elasticsearch
- Privacy: K-anonymity (k≥5)
- Update frequency: 5 minutes
- Historical data: 5 years retention

---

### FR-09: Predictive Risk AI

**Feature ID**: FR-09  
**Category**: AI/ML  
**Priority**: P1 (High)

**Description**:  
Machine learning model that predicts high-risk situations based on location, time, patterns, and behavioral signals. Proactive alerts before incidents occur.

**User Story**:  
> **As a** woman  
> **I want** to be warned before entering a risky area  
> **So that** I can take precautions or change my route

**Detailed Requirements**:
- Risk score calculation based on 20+ factors
- Proactive alerts for high-risk zones
- Pattern detection (e.g., following behavior via location)
- Time-based risk adjustment
- Crowdsourced safety data integration
- Model accuracy >85%
- Privacy-preserving ML (federated learning)
- Explainable AI (why this area is risky)

**Acceptance Criteria**:
- [ ] Risk score accuracy >85%
- [ ] Proactive alerts sent before entering high-risk zone
- [ ] Pattern detection for following behavior
- [ ] Privacy-preserving (federated learning)
- [ ] Explainable predictions
- [ ] Model retraining monthly

**Technical Specifications**:
- Model: Gradient Boosting (XGBoost)
- Features: Location, time, crime history, user reports, lighting, police presence
- Training: Federated learning on-device
- Inference: <100ms
- Retraining: Monthly with new data

---

### FR-10: Legacy App SDK

**Feature ID**: FR-10  
**Category**: Integration  
**Priority**: P1 (High)

**Description**:  
Software Development Kit for state apps to integrate with SAKHI grid in <1 hour. Enables rapid adoption without rebuilding existing apps.

**User Story**:  
> **As a** state app developer  
> **I want** to integrate with SAKHI quickly  
> **So that** our users benefit from national grid without rebuilding our app

**Detailed Requirements**:
- SDK available for Android, iOS, Web
- Integration time <1 hour
- RESTful API with OpenAPI spec
- Webhook support for real-time events
- Sample code in Java, Kotlin, Swift, JavaScript
- Comprehensive documentation
- Sandbox environment for testing
- Rate limiting: 1000 req/min per app
- Authentication: OAuth 2.0 / API keys

**Acceptance Criteria**:
- [ ] SDK for Android, iOS, Web
- [ ] Integration time <1 hour
- [ ] OpenAPI 3.0 specification
- [ ] Sample apps in all platforms
- [ ] Sandbox environment available
- [ ] Documentation with tutorials
- [ ] Rate limiting enforced

**Technical Specifications**:
- API: RESTful, OpenAPI 3.0
- Authentication: OAuth 2.0
- Rate limit: 1000 req/min
- SDK size: <2MB
- Languages: Java, Kotlin, Swift, JavaScript

---

### FR-11: Trusted Circle Auto-Alert

**Feature ID**: FR-11  
**Category**: Family Safety  
**Priority**: P0 (Critical)

**Description**:  
Automatic notification to pre-configured family/friends when SOS triggered or user enters high-risk zone.

**User Story**:  
> **As a** family member  
> **I want** to be notified immediately if my daughter triggers SOS  
> **So that** I can provide support or contact authorities

**Detailed Requirements**:
- Up to 10 trusted contacts
- SMS + push notification + phone call (escalating)
- Real-time location sharing
- One-tap "I'm safe" response
- Escalation if no response in 5 minutes
- Privacy controls (user can disable temporarily)
- Trusted circle can see live location during SOS
- Group chat for coordination

**Acceptance Criteria**:
- [ ] Up to 10 contacts supported
- [ ] Multi-channel alerts (SMS, push, call)
- [ ] Real-time location sharing
- [ ] One-tap response
- [ ] Escalation after 5 min
- [ ] Privacy controls available

**Technical Specifications**:
- SMS: Twilio/AWS SNS
- Push: FCM/APNs
- Voice: Exotel/Knowlarity
- Location: WebSocket real-time updates

---

### FR-12: Offline Mode (SMS-based)

**Feature ID**: FR-12  
**Category**: Resilience  
**Priority**: P0 (Critical)

**Description**:  
Core safety features work without internet via SMS commands and cell tower location.

**User Story**:  
> **As a** woman in a remote area without internet  
> **I want** to trigger SOS via SMS  
> **So that** I can get help even offline

**Detailed Requirements**:
- SMS keyword commands: HELP, SAFE, LOCATION
- Cell tower triangulation for location
- SMS confirmation within 10 seconds
- Works on 2G networks
- Toll-free SMS number
- No data charges
- Sync when back online

**Acceptance Criteria**:
- [ ] SMS commands work without internet
- [ ] Cell tower location accuracy <500m
- [ ] SMS confirmation in <10 seconds
- [ ] Works on 2G
- [ ] Toll-free for users
- [ ] Data syncs when online

**Technical Specifications**:
- SMS gateway: Bulk SMS API
- Location: Cell tower triangulation
- Network: 2G compatible
- Sync: Queue-based when online

---

### FR-13: Area Risk Check

**Feature ID**: FR-13  
**Category**: Information  
**Priority**: P2 (Medium)

**Description**:  
On-demand safety score for any location before visiting. Helps women make informed decisions about where to go.

**User Story**:  
> **As a** woman planning to visit a new area  
> **I want** to check its safety score  
> **So that** I can make informed decisions

**Detailed Requirements**:
- Search by address, landmark, or pin code
- Safety score 0-100 with explanation
- Recent incidents summary (anonymized)
- Best/worst times to visit
- User reviews and ratings
- Police station proximity
- Street lighting data
- Public transport availability

**Acceptance Criteria**:
- [ ] Search by address/landmark/pin
- [ ] Safety score with explanation
- [ ] Recent incidents (anonymized)
- [ ] Time-based recommendations
- [ ] User reviews visible
- [ ] Police station distance shown

**Technical Specifications**:
- Search: Elasticsearch with geospatial
- Score: Weighted algorithm (crime, lighting, police, reviews)
- Data: NCRB, user reports, OpenStreetMap

---

### FR-14: Scheduled Check-in

**Feature ID**: FR-14  
**Category**: Preventive Safety  
**Priority**: P2 (Medium)

**Description**:  
Automated check-in system that alerts contacts if user doesn't confirm safety by scheduled time.

**User Story**:  
> **As a** woman traveling alone  
> **I want** to set a check-in time  
> **So that** my family is alerted if I don't respond

**Detailed Requirements**:
- User sets check-in time and contacts
- Push notification + SMS reminder
- Auto-alert if no response in 15 minutes
- Snooze option (15/30/60 minutes)
- Location shared with contacts
- Escalation to police if no response in 30 minutes
- Recurring check-ins (daily commute)

**Acceptance Criteria**:
- [ ] User can set check-in time
- [ ] Reminder sent at scheduled time
- [ ] Auto-alert after 15 min no response
- [ ] Snooze functionality
- [ ] Location shared with contacts
- [ ] Police escalation after 30 min

**Technical Specifications**:
- Scheduler: Cron jobs / AWS EventBridge
- Notifications: Push + SMS
- Escalation: Automatic SOS trigger

---

### FR-15: Volunteer Network Integration

**Feature ID**: FR-15  
**Category**: Community Support  
**Priority**: P2 (Medium)

**Description**:  
Connect with verified local volunteers (NGOs, community groups) for immediate on-ground support while police arrive.

**User Story**:  
> **As a** woman in distress  
> **I want** nearby volunteers to be notified  
> **So that** I get community support while police arrive

**Detailed Requirements**:
- Volunteer registration with background verification
- Proximity-based volunteer alerts (<2km radius)
- Volunteer response tracking
- Rating system for volunteers
- NGO partnership integration
- Volunteer training certification
- Insurance coverage for volunteers
- Volunteer safety protocols

**Acceptance Criteria**:
- [ ] Volunteers verified with background check
- [ ] Alerts sent to volunteers within 2km
- [ ] Volunteer response tracked
- [ ] Rating system functional
- [ ] NGO partnerships active
- [ ] Training certification required

**Technical Specifications**:
- Verification: Police verification API
- Geofencing: 2km radius alerts
- Rating: 5-star system
- Training: Online certification module

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

| Requirement | Target | Measurement Method |
|-------------|--------|-------------------|
| **SOS Response Time** | <200ms | Time from trigger to police notification |
| **App Launch Time** | <2s | Cold start on mid-range Android device |
| **API Response Time** | <500ms | 95th percentile for all endpoints |
| **Concurrent Users** | 1M+ | Simultaneous active users supported |
| **Database Query Time** | <100ms | 99th percentile for read operations |
| **Evidence Upload** | <30s | 10MB video file on 4G network |
| **Location Detection** | <100ms | GPS lock time |
| **Route Calculation** | <2s | Safe route with 3 alternatives |
| **Voice Recognition** | <2s | Speech-to-text processing |
| **FIR Generation** | <5min | From SOS to FIR number |

### 4.2 Scalability Requirements

- **Horizontal Scaling**: Auto-scale to handle 10M concurrent users
- **Database**: Sharded architecture supporting 100M+ user profiles
- **Storage**: Unlimited evidence storage with S3 lifecycle policies
- **Geographic Distribution**: Multi-region deployment (Mumbai, Delhi, Bangalore)
- **Load Balancing**: Application Load Balancer across availability zones
- **CDN**: CloudFront for static assets, <50ms latency
- **Message Queue**: SQS for async processing, 100K messages/sec
- **Cache**: Redis cluster for session data, 99.9% hit rate

### 4.3 Availability Requirements

| Component | Uptime Target | Downtime/Month | Recovery |
|-----------|---------------|----------------|----------|
| **SOS Endpoints** | 99.95% | 21.9 minutes | <60s failover |
| **General App** | 99.9% | 43.8 minutes | <5min recovery |
| **Admin Dashboard** | 99.5% | 3.6 hours | <15min recovery |
| **Analytics** | 99% | 7.2 hours | <30min recovery |

**High Availability Architecture**:
- Multi-AZ deployment across 3 availability zones
- Automatic failover within 60 seconds
- Active-active configuration for SOS endpoints
- Database replication with <1s lag
- Disaster recovery: RPO <15 minutes, RTO <1 hour
- Daily automated backups with 90-day retention
- Cross-region backup for critical data

### 4.4 Security Requirements

| Component | Requirement | Implementation |
|-----------|-------------|----------------|
| **Data Encryption** | AES-256 at rest, TLS 1.3 in transit | AWS KMS, ACM |
| **Authentication** | Multi-factor authentication | Aadhaar OTP + Mobile OTP |
| **Authorization** | Role-based access control (RBAC) | AWS IAM + custom policies |
| **API Security** | Rate limiting, WAF protection | AWS WAF, API Gateway |
| **Evidence Storage** | End-to-end encryption | Client-side encryption before upload |
| **Audit Logging** | All access logged and monitored | CloudWatch, CloudTrail |
| **Penetration Testing** | Quarterly security audits | Third-party CERT-In certified |
| **Vulnerability Scanning** | Automated daily scans | AWS Inspector, Snyk |
| **DDoS Protection** | Layer 3/4/7 protection | AWS Shield Advanced |
| **Secrets Management** | Encrypted secrets rotation | AWS Secrets Manager |

**Security Protocols**:
- Zero-trust architecture
- Principle of least privilege
- Network segmentation (VPC, subnets, security groups)
- Intrusion detection system (IDS)
- Security incident response plan
- Regular security training for team
- Bug bounty program

### 4.5 Compliance Requirements

| Regulation | Requirement | Status |
|------------|-------------|--------|
| **India Data Protection Bill** | Data localization, consent management | Mandatory |
| **GDPR** | Right to erasure, data portability | Ready |
| **IT Act 2000** | Section 43A data protection | Compliant |
| **CrPC Section 154** | FIR generation compliance | Compliant |
| **MEITY Guidelines** | Government app security standards | Compliant |
| **ISO 27001** | Information security management | Target: Year 1 |
| **SOC 2 Type II** | Service organization controls | Target: Year 2 |
| **CERT-In Guidelines** | Incident reporting within 6 hours | Compliant |

**Data Residency**:
- All data stored in India (Mumbai, Delhi regions)
- No cross-border data transfer
- State data isolated in separate databases
- User consent for data sharing

### 4.6 Usability Requirements

- **Language Support**: 12+ Indian languages + English
- **Accessibility**: WCAG 2.1 Level AA compliance
  - Screen reader support
  - High contrast mode
  - Font size adjustment
  - Voice navigation
- **Voice-First**: Hands-free operation for critical features
- **Low Literacy**: Icon-based navigation, voice guidance
- **Feature Phone**: Full functionality via USSD/IVR/SMS
- **Onboarding**: <3 minutes to complete registration
- **Help System**: Contextual help in vernacular languages
- **Error Messages**: Clear, actionable, in user's language
- **Offline Indicators**: Clear indication when offline

### 4.7 Reliability Requirements

- **Data Durability**: 99.999999999% (11 nines) for evidence
- **Message Delivery**: 99.9% SMS delivery rate
- **Location Accuracy**: <50m radius for GPS, <500m for cell tower
- **Evidence Integrity**: SHA-256 hash verification
- **Failover**: Automatic with zero data loss
- **Monitoring**: 24/7 automated health checks
- **Alerting**: PagerDuty for critical incidents
- **Mean Time to Recovery (MTTR)**: <15 minutes
- **Mean Time Between Failures (MTBF)**: >720 hours

### 4.8 Maintainability Requirements

- **Code Quality**: 80%+ test coverage, SonarQube A rating
- **Documentation**: 
  - API documentation (OpenAPI 3.0)
  - Architecture diagrams (C4 model)
  - Runbooks for operations
  - Developer onboarding guide
- **Logging**: Structured logging with correlation IDs
- **Monitoring**: 
  - Real-time dashboards (Grafana)
  - Application metrics (Prometheus)
  - Business metrics (Mixpanel)
- **Deployment**: 
  - Blue-green deployment
  - Automated rollback on failure
  - Canary releases for new features
- **Version Control**: Git-based workflow, semantic versioning
- **CI/CD**: Automated testing, security scanning, deployment
- **Technical Debt**: <10% of sprint capacity

### 4.9 Compatibility Requirements

**Mobile Apps**:
- Android: 8.0 (API 26) and above (covers 95% devices)
- iOS: 13.0 and above (covers 98% devices)
- App size: <50MB

**Web App**:
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Responsive design (mobile, tablet, desktop)
- Progressive Web App (PWA) support

**Feature Phones**:
- 2G/3G networks
- SMS, USSD, IVR support
- All operators (Airtel, Jio, Vi, BSNL)

**Integrations**:
- State app APIs (REST, SOAP)
- Police systems (various protocols)
- Maps (Google Maps, MapMyIndia)
- Payment gateways (future)

---

## 5. User Stories

### 5.1 Woman User (Smartphone)

**US-01: Quick Registration**  
As a woman with a smartphone, I want to register with my mobile number in under 3 minutes, so that I can access safety features quickly without lengthy forms.

**US-02: One-Tap SOS**  
As a woman feeling unsafe, I want to trigger SOS with one tap, so that help arrives immediately without fumbling through menus.

**US-03: Live Location Sharing**  
As a woman traveling alone, I want to share my live location with family, so that they know where I am at all times.

**US-04: Silent Evidence Recording**  
As a woman in danger, I want to record evidence silently without the attacker knowing, so that I have proof for legal action.

**US-05: Safe Route Planning**  
As a woman planning a trip, I want to check route safety scores, so that I can choose the safest path and avoid high-risk areas.

**US-06: Proactive Risk Alerts**  
As a woman, I want to receive alerts when entering high-risk areas, so that I can take precautions or change my route immediately.

**US-07: Voice Commands**  
As a woman driving, I want to use voice commands in my language, so that I can trigger SOS hands-free without touching my phone.

**US-08: Cross-State Travel**  
As a woman traveling from Kerala to Delhi, I want my safety profile to work in both states, so that I don't need to register separately.

**US-09: Scheduled Check-ins**  
As a woman working late, I want to set automatic check-ins, so that my family is alerted if I don't reach home on time.

**US-10: Area Safety Check**  
As a woman visiting a new neighborhood, I want to check its safety score before going, so that I can make informed decisions.

---

### 5.2 Woman User (Feature Phone)

**US-11: Missed Call SOS**  
As a woman with a basic phone, I want to trigger SOS with a missed call to a toll-free number, so that I don't need internet or smartphone.

**US-12: SMS Commands**  
As a woman without internet, I want to send SMS "HELP" to get emergency assistance, so that I can access safety features offline.

**US-13: Voice-Based IVR**  
As a woman who doesn't read, I want voice-based IVR in my language, so that I can use the system without literacy barriers.

**US-14: Zero Balance SOS**  
As a woman in a village with no phone balance, I want missed call SOS to work, so that I can get help even without recharge.

**US-15: SMS Registration**  
As a woman with a feature phone, I want to register via SMS, so that I can access safety features without downloading an app.

**US-16: USSD Menu**  
As a woman with a basic phone, I want to use USSD menu (*#767#), so that I can access features without internet.

**US-17: SMS Confirmation**  
As a woman who triggered SOS via SMS, I want immediate confirmation, so that I know help is coming.

**US-18: Add Contacts via SMS**  
As a woman with a feature phone, I want to add trusted contacts via SMS, so that they receive alerts during emergencies.

---

### 5.3 Family Member

**US-19: Instant SOS Alerts**  
As a family member, I want to be notified immediately when my daughter triggers SOS, so that I can provide support or contact authorities.

**US-20: Live Location Tracking**  
As a parent, I want to see my daughter's live location during SOS, so that I know exactly where she is and can guide police.

**US-21: High-Risk Area Alerts**  
As a husband, I want to receive alerts if my wife enters a dangerous area, so that I can call and check on her safety.

**US-22: Check-in Monitoring**  
As a brother, I want to be alerted if my sister doesn't respond to scheduled check-ins, so that I can take action quickly.

**US-23: One-Tap Response**  
As a family member receiving an alert, I want to respond with one tap "I'm on my way", so that my daughter knows help is coming.

**US-24: Trusted Circle Coordination**  
As a family member, I want to coordinate with other trusted contacts during SOS, so that we can provide comprehensive support.

**US-25: Historical Location**  
As a parent, I want to see my daughter's location history during SOS, so that I understand her movement pattern.

---

### 5.4 Police Dispatcher

**US-26: Instant SOS Routing**  
As a police dispatcher, I want to receive SOS alerts with precise location, so that I can dispatch help immediately to the right place.

**US-27: User Profile Access**  
As a police officer, I want to access user profile and medical info during SOS, so that I can provide appropriate assistance.

**US-28: Auto-Generated FIR**  
As a police station, I want auto-generated FIRs with evidence, so that legal process starts without paperwork delays.

**US-29: Evidence Access**  
As a police officer, I want to access evidence recordings securely, so that I can investigate the case effectively.

**US-30: Live SOS Map**  
As a police control room, I want to see all active SOS on a map, so that I can coordinate response and allocate resources.

**US-31: Incident History**  
As a police officer, I want to see user's previous incidents, so that I can understand if this is a repeat case.

**US-32: Response Acknowledgment**  
As a police dispatcher, I want to acknowledge SOS receipt, so that the user knows help is on the way.

**US-33: ETA Communication**  
As a police officer, I want to send ETA to the user, so that she knows when to expect help.

---

### 5.5 Ministry Official

**US-34: National Safety Heatmap**  
As a Ministry official, I want to see national safety heatmap, so that I can identify problem areas and allocate resources.

**US-35: Trend Analysis**  
As a policy maker, I want to analyze safety trends over time, so that I can measure intervention effectiveness.

**US-36: State Comparison**  
As a government administrator, I want to compare state performance, so that I can identify best practices and areas needing improvement.

**US-37: Report Generation**  
As a Ministry official, I want to generate reports for Parliament, so that I can present data-driven insights.

**US-38: Real-Time Dashboard**  
As a state coordinator, I want real-time dashboard of incidents, so that I can monitor situation and respond quickly.

**US-39: Resource Allocation**  
As a policy maker, I want to see which areas need more police presence, so that I can allocate resources effectively.

**US-40: Impact Measurement**  
As a Ministry official, I want to measure SAKHI's impact on safety, so that I can justify continued funding.

---

### 5.6 State App Developer

**US-41: Quick SDK Integration**  
As a state app developer, I want to integrate SAKHI SDK in under 1 hour, so that our users benefit from national grid quickly.

**US-42: Comprehensive Documentation**  
As a developer, I want comprehensive API documentation with examples, so that I can implement features correctly.

**US-43: Sandbox Testing**  
As a technical lead, I want sandbox environment for testing, so that I can verify integration before production.

**US-44: Webhook Notifications**  
As a developer, I want webhook notifications for real-time events, so that I can sync data automatically.

**US-45: Sample Code**  
As a developer, I want sample code in my platform (Android/iOS/Web), so that I can quickly understand implementation.

**US-46: API Monitoring**  
As a technical lead, I want to monitor our API usage and errors, so that I can maintain service quality.

**US-47: Version Management**  
As a developer, I want clear SDK versioning and migration guides, so that I can upgrade without breaking changes.

---

## 6. Constraints and Assumptions

### 6.1 Technical Constraints

| Constraint | Description | Impact |
|------------|-------------|--------|
| **Internet Connectivity** | Cannot assume reliable internet access | Must support offline/SMS fallback for all critical features |
| **Device Capability** | Must work on feature phones with 2G networks | Limits rich media, requires SMS/USSD/IVR alternatives |
| **Battery Life** | Background services must be battery-efficient | Limits continuous GPS tracking, requires optimization |
| **Storage** | App size <50MB for low-end devices | Limits on-device ML models, media assets |
| **Bandwidth** | Optimize for 2G/3G networks (128kbps) | Compress data, lazy loading, progressive enhancement |
| **GPS Accuracy** | GPS unavailable in buildings/rural areas | Cell tower fallback required, <500m accuracy |
| **Platform Fragmentation** | 1000+ Android device models | Extensive testing, graceful degradation |
| **Legacy Systems** | State police systems vary widely | Multiple integration protocols needed |

### 6.2 Business Constraints

| Constraint | Description | Mitigation |
|------------|-------------|------------|
| **Budget** | Government-funded with budget limits | Phased rollout, open-source where possible |
| **Timeline** | MVP launch within 6 months | Prioritize P0 features, defer P2 features |
| **Stakeholders** | 28+ state governments must approve | Early engagement, pilot programs |
| **Partnerships** | Requires MoU with state police | Legal team to expedite agreements |
| **Toll-Free Numbers** | Limited availability from DoT | Apply early, have backup short codes |
| **Data Localization** | All data must remain in India | AWS India regions only |
| **Procurement** | Government procurement processes | Plan for 3-6 month procurement cycles |
| **Change Management** | Police training required | Comprehensive training program |

### 6.3 Regulatory Constraints

| Regulation | Requirement | Compliance Strategy |
|------------|-------------|---------------------|
| **Privacy Laws** | India Data Protection Bill compliance | Privacy by design, consent management |
| **Police Procedures** | Must align with CrPC | Legal review of all FIR processes |
| **Aadhaar Integration** | Subject to UIDAI guidelines | Make optional, use privacy-preserving methods |
| **Telecom Regulations** | SMS/IVR requires TRAI approval | Apply for DLT registration early |
| **Evidence Admissibility** | Digital evidence must be court-admissible | Cryptographic signatures, chain of custody |
| **CERT-In Guidelines** | Incident reporting within 6 hours | Automated reporting system |
| **RTI Act** | Public information requests | Clear data classification, redaction processes |

### 6.4 Assumptions

**User Adoption**:
- 10M users in Year 1 (5M smartphone + 5M feature phone)
- 100M users in Year 5
- 70% retention rate after 6 months
- 20% monthly active usage

**State Cooperation**:
- 20+ states will adopt SDK in Year 1
- All 28 states + 8 UTs by Year 2
- State apps will integrate within 1 month of SDK release
- States will share crime data via APIs

**Data Availability**:
- NCRB provides historical crime data
- State police provide real-time incident data
- OpenStreetMap data available for mapping
- Cell tower location data accessible

**Infrastructure**:
- AWS services available in India regions
- 99.9% uptime for AWS services
- Telecom operators support toll-free SMS
- Internet penetration continues to grow

**Partnerships**:
- 1000+ NGOs join volunteer network
- Telecom operators provide priority routing for SOS
- Map providers (Google/MapMyIndia) provide APIs
- Police departments cooperate with training

**Funding**:
- Continued government funding for 5 years
- ₹100 crore budget for Year 1
- ₹50 crore annual operational budget
- Additional funding for scaling

**Technology**:
- Mobile device penetration reaches 80% by Year 3
- 4G coverage expands to rural areas
- Feature phones remain relevant for 5+ years
- AI/ML models improve with more data

### 6.5 Dependencies

**External APIs**:
- Google Maps / MapMyIndia for routing
- NCRB database for crime statistics
- Aadhaar API for identity verification (optional)
- State police e-FIR systems
- Weather APIs for risk calculation

**Telecom Operators**:
- Airtel, Jio, Vodafone-Idea, BSNL for SMS/IVR
- Priority routing for emergency messages
- Cell tower location data
- Toll-free number allocation

**Government Systems**:
- Aadhaar for identity (optional)
- DigiLocker for document storage
- State e-FIR systems
- Police station databases
- NCRB data feeds

**State Apps**:
- Cooperation from 28+ state safety apps
- API access to state systems
- Data sharing agreements
- Joint marketing efforts

**Cloud Provider**:
- AWS India regions (Mumbai, Delhi, Bangalore)
- 99.9% SLA for critical services
- Compliance with data localization
- Government cloud certification

**Third-Party Services**:
- SMS gateway (Twilio/AWS SNS)
- IVR platform (Exotel/Knowlarity)
- Push notifications (FCM/APNs)
- Analytics (Mixpanel/Amplitude)
- Monitoring (Datadog/New Relic)

### 6.6 Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **State resistance to integration** | Medium | High | Pilot programs, central government mandate |
| **Privacy concerns from users** | High | Medium | Transparent policies, user controls, education |
| **False SOS overwhelming police** | High | High | 30s cancellation window, ML-based filtering |
| **Telecom operator delays** | Medium | High | Multi-operator redundancy, early engagement |
| **Budget overruns** | Medium | Medium | Phased rollout, cost monitoring, open-source |
| **Security breaches** | Low | Critical | Defense in depth, regular audits, bug bounty |
| **Low user adoption** | Medium | High | Marketing campaign, partnerships, training |
| **Technical failures during SOS** | Low | Critical | Multi-AZ, failover, SMS fallback |
| **Data localization compliance** | Low | High | AWS India regions only, regular audits |
| **Volunteer safety incidents** | Medium | High | Background checks, training, insurance |

---

## 7. Glossary

| Term | Definition |
|------|------------|
| **Sakhi ID** | Unique national safety identifier (format: SAKHI-[STATE]-[10-DIGIT]) portable across all states and apps |
| **SOS Relay** | Intelligent routing of emergency signals to appropriate authorities based on current location, not registration state |
| **IVR** | Interactive Voice Response - automated phone system allowing feature phone users to access services via voice menu |
| **SDK** | Software Development Kit - tools and libraries enabling state apps to integrate with SAKHI in <1 hour |
| **Trusted Circle** | Pre-configured list of up to 10 family/friends who receive automatic alerts during emergencies |
| **Auto-FIR** | Automatically generated First Information Report filed with police, compliant with CrPC Section 154 |
| **Silent Evidence Mode** | Covert audio/video recording feature activated via power button 3x press, no visible indicator |
| **Safety Heatmap** | Visual representation of incident density across geographic areas, updated in real-time |
| **Predictive Risk AI** | Machine learning model forecasting high-risk situations based on location, time, patterns (>85% accuracy) |
| **Feature Phone** | Basic mobile phone without smartphone capabilities, supporting 2G/3G, SMS, USSD, IVR |
| **Cell Tower Triangulation** | Location detection method using signal strength from multiple cell towers (accuracy <500m) |
| **USSD** | Unstructured Supplementary Service Data - protocol for feature phone services (e.g., *#767#) |
| **NCRB** | National Crime Records Bureau - maintains India's crime statistics database |
| **CrPC** | Code of Criminal Procedure - legal framework for criminal justice in India |
| **MEITY** | Ministry of Electronics and Information Technology - governs digital initiatives |
| **MHA** | Ministry of Home Affairs - oversees internal security and police forces |
| **UIDAI** | Unique Identification Authority of India - manages Aadhaar system |
| **TRAI** | Telecom Regulatory Authority of India - regulates telecom services |
| **DoT** | Department of Telecommunications - allocates toll-free numbers |
| **KMS** | Key Management Service - AWS service for encryption key management |
| **WAF** | Web Application Firewall - protects against web-based attacks |
| **IAM** | Identity and Access Management - controls user permissions and access |
| **Multi-AZ** | Multiple Availability Zones - distributed infrastructure across data centers for reliability |
| **RPO** | Recovery Point Objective - maximum acceptable data loss (target: <15 minutes) |
| **RTO** | Recovery Time Objective - maximum acceptable downtime (target: <1 hour) |
| **RBAC** | Role-Based Access Control - permission system based on user roles |
| **WCAG** | Web Content Accessibility Guidelines - accessibility standards (target: Level AA) |
| **Federated Learning** | Privacy-preserving ML where models train on distributed data without centralizing |
| **Blue-Green Deployment** | Zero-downtime deployment with two production environments for safe releases |
| **DLT** | Distributed Ledger Technology / Telecom DLT registration for SMS |
| **FCM** | Firebase Cloud Messaging - push notification service for Android |
| **APNs** | Apple Push Notification service - push notification service for iOS |
| **PostGIS** | PostgreSQL extension for geographic objects and spatial queries |
| **Geofencing** | Virtual perimeter for real-world geographic area, triggers alerts when crossed |
| **K-Anonymity** | Privacy technique ensuring each record is indistinguishable from k-1 others (k≥5) |
| **XGBoost** | Gradient Boosting machine learning algorithm used for risk prediction |
| **OpenAPI** | Specification for REST APIs, enables automatic documentation and client generation |
| **OAuth 2.0** | Industry-standard protocol for authorization and API access |
| **SHA-256** | Cryptographic hash function for evidence integrity verification |
| **AES-256** | Advanced Encryption Standard with 256-bit key for data encryption |
| **TLS 1.3** | Transport Layer Security protocol for secure data transmission |
| **CERT-In** | Indian Computer Emergency Response Team - handles cybersecurity incidents |
| **RTI Act** | Right to Information Act - mandates transparency in government operations |
| **SLA** | Service Level Agreement - commitment to service availability and performance |
| **MTTR** | Mean Time To Recovery - average time to restore service after failure |
| **MTBF** | Mean Time Between Failures - average time between system failures |
| **CI/CD** | Continuous Integration/Continuous Deployment - automated software delivery |
| **PWA** | Progressive Web App - web application with native app-like features |
| **C4 Model** | Context, Containers, Components, Code - software architecture documentation method |

---

## 8. Success Metrics

### 8.1 User Adoption Metrics

| Metric | Year 1 Target | Year 2 Target | Year 5 Target |
|--------|---------------|---------------|---------------|
| **Total Registered Users** | 10M | 50M | 100M |
| **Smartphone Users** | 5M | 30M | 60M |
| **Feature Phone Users** | 5M | 20M | 40M |
| **Monthly Active Users** | 2M (20%) | 15M (30%) | 40M (40%) |
| **User Retention (6 months)** | 70% | 75% | 80% |
| **App Store Rating** | 4.5+ stars | 4.6+ stars | 4.7+ stars |
| **State Coverage** | 20 states | 28 states + 8 UTs | 100% |

### 8.2 Safety Impact Metrics

| Metric | Baseline | Year 1 Target | Year 2 Target |
|--------|----------|---------------|---------------|
| **SOS Response Time** | 15 min (avg) | 5 min (avg) | 3 min (avg) |
| **FIR Filing Rate** | 30% | 80% | 90% |
| **Incident Prevention** | - | 10% reduction | 30% reduction |
| **Repeat Incidents** | - | 15% reduction | 25% reduction |
| **User Satisfaction** | - | 85% | 90% |
| **Police Response Rate** | 60% | 90% | 95% |

### 8.3 Technical Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **SOS Endpoint Uptime** | 99.95% | Monthly average |
| **SOS Response Time** | <200ms | 95th percentile |
| **App Launch Time** | <2s | 95th percentile |
| **API Success Rate** | >99.5% | Monthly average |
| **Evidence Upload Success** | >99% | Monthly average |
| **SMS Delivery Rate** | >99.9% | Monthly average |
| **Location Accuracy** | <50m GPS, <500m cell | Average |

### 8.4 Integration Metrics

| Metric | Year 1 Target | Year 2 Target |
|--------|---------------|---------------|
| **State Apps Integrated** | 20+ | 28+ (all states) |
| **SDK Integration Time** | <1 hour | <30 minutes |
| **API Success Rate** | >99% | >99.5% |
| **Police Stations Connected** | 5,000+ | 16,000+ (all) |
| **NGO Partners** | 500+ | 1,000+ |
| **Volunteer Network** | 10,000+ | 50,000+ |

### 8.5 Business Metrics

| Metric | Year 1 | Year 2 | Year 5 |
|--------|--------|--------|--------|
| **Total SOS Handled** | 100K+ | 1M+ | 10M+ |
| **Auto-FIRs Generated** | 50K+ | 500K+ | 5M+ |
| **Evidence Collected** | 30K+ cases | 300K+ cases | 3M+ cases |
| **Cost per User** | ₹100 | ₹50 | ₹20 |
| **Government Savings** | ₹50 crore | ₹200 crore | ₹1,000 crore |

### 8.6 Policy Impact Metrics

- **States using heatmap for policy**: 15+ by Year 2
- **Resource allocation improvements**: 30% better targeting
- **High-risk area interventions**: 50+ areas by Year 2
- **National safety reports**: Quarterly to Parliament
- **International recognition**: Model for other countries

---

## 9. Future Enhancements (Out of Scope for MVP)

### Phase 2 (Year 2-3)

**FR-16: International Traveler Support**
- Passport integration for foreign visitors
- Multi-country SOS relay
- Embassy notification system
- Tourist safety package

**FR-17: AI-Powered Fake Call**
- Realistic fake call for escape scenarios
- Customizable caller ID and conversation
- Voice synthesis in multiple languages
- Triggered via voice command or gesture

**FR-18: Wearable Device Integration**
- Smartwatch SOS button
- Fitness tracker integration
- Smart jewelry (panic button rings/bracelets)
- Heart rate monitoring for distress detection

**FR-19: Public Transport Safety**
- Bus/train/auto safety ratings
- Driver verification and ratings
- Route tracking and sharing
- Integration with transport apps (Uber, Ola)

**FR-20: Workplace Safety Module**
- Corporate environment safety features
- Anonymous harassment reporting
- HR integration for incident management
- Workplace safety scores

### Phase 3 (Year 4-5)

**FR-21: Blockchain Evidence Chain**
- Immutable evidence chain of custody
- Tamper-proof timestamps
- Court-admissible blockchain certificates
- Decentralized evidence storage

**FR-22: Mental Health Crisis Support**
- Integration with mental health helplines
- AI detection of distress in voice/text
- Counselor network connection
- Suicide prevention features

**FR-23: Educational Institution Integration**
- College campus safety features
- Hostel check-in systems
- Parent-institution communication
- Campus safety scores

**FR-24: Legal Aid Marketplace**
- Connect with verified lawyers
- Free legal consultation for victims
- Case tracking and updates
- Legal aid fund integration

**FR-25: Tourism Safety Package**
- Foreign visitor onboarding
- Multi-language support (50+ languages)
- Tourist police integration
- Travel insurance integration

### Research & Innovation

- **Drone Response**: Autonomous drones for visual verification
- **AR Safety**: Augmented reality for safe route visualization
- **Biometric Distress**: Heart rate/stress detection via wearables
- **Satellite SOS**: Emergency communication via satellite (no cell coverage)
- **AI Companion**: Conversational AI for emotional support during crisis
- **Predictive Policing**: AI-driven patrol route optimization
- **Social Media Integration**: Automatic social media alerts during SOS
- **Insurance Integration**: Safety score-based insurance discounts

---

## 10. Appendices

### Appendix A: Technology Stack

**Frontend**:
- Mobile: React Native (iOS/Android)
- Web: React.js with Next.js
- State Management: Redux Toolkit
- UI: Tailwind CSS, Material-UI

**Backend**:
- API: Node.js with Express
- Authentication: JWT, OAuth 2.0
- Real-time: Socket.io, WebSockets
- Background Jobs: Bull Queue with Redis

**Database**:
- Primary: PostgreSQL with PostGIS
- Cache: Redis Cluster
- NoSQL: DynamoDB for user profiles
- Search: Elasticsearch

**AI/ML**:
- Framework: TensorFlow, PyTorch
- Model Serving: TensorFlow Serving
- Training: AWS SageMaker
- On-device: TensorFlow Lite

**Infrastructure**:
- Cloud: AWS (Mumbai, Delhi, Bangalore regions)
- Compute: ECS Fargate, Lambda
- Storage: S3, EBS
- CDN: CloudFront
- Load Balancer: Application Load Balancer

**DevOps**:
- CI/CD: GitHub Actions, AWS CodePipeline
- Monitoring: CloudWatch, Prometheus, Grafana
- Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
- Alerting: PagerDuty
- Security: AWS WAF, Shield, GuardDuty

### Appendix B: API Endpoints (Sample)

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/sos/trigger
GET  /api/v1/sos/status/:id
POST /api/v1/sos/cancel/:id
GET  /api/v1/profile/me
PUT  /api/v1/profile/me
POST /api/v1/trusted-circle/add
GET  /api/v1/routes/safe?from=lat,lng&to=lat,lng
GET  /api/v1/area/risk?location=lat,lng
POST /api/v1/evidence/upload
GET  /api/v1/heatmap?state=KL&date=2026-02-15
```

### Appendix C: State Integration Status

| State | App Name | Status | Integration Date |
|-------|----------|--------|------------------|
| Kerala | Pink Police | Planned | Q2 2026 |
| Delhi | Himmat Plus | Planned | Q2 2026 |
| Maharashtra | Maha Rakshak | Planned | Q3 2026 |
| Tamil Nadu | Kavalan SOS | Planned | Q3 2026 |
| Karnataka | Suraksha | Planned | Q3 2026 |
| ... | ... | ... | ... |

### Appendix D: Compliance Checklist

- [ ] India Data Protection Bill compliance audit
- [ ] GDPR readiness assessment
- [ ] ISO 27001 certification process initiated
- [ ] SOC 2 Type II audit scheduled
- [ ] CERT-In incident reporting system configured
- [ ] MEITY security guidelines implemented
- [ ] CrPC Section 154 FIR compliance verified
- [ ] TRAI DLT registration completed
- [ ] DoT toll-free number allocated
- [ ] UIDAI Aadhaar integration approved

---

**Document Version**: 1.0  
**Last Updated**: February 15, 2026  
**Owner**: SAKHI Project Team  
**Approvers**: Ministry of Home Affairs, MEITY  
**Status**: Final - Ready for Implementation  
**Next Review**: March 15, 2026

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | Jan 15, 2026 | Project Team | Initial draft |
| 0.5 | Feb 1, 2026 | Project Team | Stakeholder feedback incorporated |
| 1.0 | Feb 15, 2026 | Project Team | Final version approved |

**Distribution List**:
- Ministry of Home Affairs
- Ministry of Electronics and Information Technology
- All State Chief Secretaries
- State Police Chiefs
- NCRB Director
- Project Implementation Team

**Confidentiality**: Government of India - Internal Use Only

---

*For questions or clarifications, contact: sakhi-project@gov.in*
