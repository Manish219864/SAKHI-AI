# SAKHI - Design Document
## National Women's Safety Interoperability Grid

---

## 1. System Architecture Overview

### 1.1 Architecture Philosophy

SAKHI is built on a **serverless, cloud-native architecture** leveraging AWS services for maximum scalability, reliability, and cost-efficiency. The system is designed with three core principles:

1. **Zero Cold Start for SOS**: Critical emergency endpoints use Lambda Provisioned Concurrency
2. **Multi-Region Resilience**: Active-active deployment across Mumbai, Delhi, and Bangalore regions
3. **Privacy by Design**: End-to-end encryption with on-device processing for sensitive data

### 1.2 Three-Layer Architecture

**Layer 1: Unified Identity Layer**
- Single Sakhi ID across all states
- Federated identity management via Cognito
- Profile synchronization using DynamoDB Global Tables
- Cross-state authentication with JWT tokens

**Layer 2: Cross-State Relay Layer**
- Real-time SOS routing based on geolocation
- Multi-channel alerting (SMS, push, voice call)
- Police station jurisdiction mapping
- Evidence collection and auto-FIR generation

**Layer 3: Predictive AI Layer**
- Risk scoring using SageMaker XGBoost models
- Route safety prediction
- Pattern detection for following behavior
- Heatmap generation for policy insights

### 1.3 High-Level Architecture Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Mobile App (React Native)  │  Web App (React)  │  Feature Phone (IVR)  │
│  - Smartphone (Android/iOS) │  - Admin Dashboard│  - SMS/USSD/Voice     │
│  - Offline-first            │  - Heatmap Viewer │  - Toll-free number   │
└──────────────┬──────────────┴──────────┬────────┴───────────────────────┘
               │                         │
               ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          EDGE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  CloudFront CDN  │  Lambda@Edge (SDK)  │  AWS WAF  │  AWS Shield       │
│  - Static assets │  - State app proxy  │  - DDoS   │  - Rate limiting  │
└──────────────┬──────────────────────────┬──────────────────────────────┘
               │                          │
               ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│  API Gateway (REST)  │  API Gateway (WebSocket)  │  Amazon Connect      │
│  - /auth/*           │  - Live location tracking │  - IVR system        │
│  - /sos/*            │  - Real-time alerts       │  - Voice menu        │
│  - /profile/*        │  - Family coordination    │  - Call recording    │
│  - /route/*          │                           │                      │
└──────────────┬───────────────────┬────────────────┬─────────────────────┘
               │                   │                │
               ▼                   ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       COMPUTE LAYER (Lambda Functions)                   │
├─────────────────────────────────────────────────────────────────────────┤
│ auth-handler      │ sos-handler*      │ profile-manager  │ route-planner│
│ - Register        │ - Trigger SOS     │ - CRUD profile   │ - Safe routes│
│ - Login           │ - Cancel SOS      │ - Sync states    │ - Risk score │
│ - MFA             │ - Status check    │ - Federation     │              │
├───────────────────┼───────────────────┼──────────────────┼──────────────┤
│ fir-generator     │ risk-analyzer     │ relay-service    │ evidence-saver│
│ - Bedrock prompt  │ - SageMaker model │ - Police routing │ - S3 upload  │
│ - PDF generation  │ - Heatmap data    │ - SMS/Push/Call  │ - Encryption │
├───────────────────┼───────────────────┼──────────────────┼──────────────┤
│ sdk-adapter       │ ivr-handler       │ location-tracker │ alert-manager│
│ - State app API   │ - Feature phone   │ - GPS/Cell tower │ - Trusted    │
│ - Webhook relay   │ - Voice commands  │ - Geofencing     │   circle     │
└──────────────┬────────────┬───────────┬──────────────┬──────────────────┘
               │            │           │              │
               ▼            ▼           ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ RDS PostgreSQL (Multi-AZ)     │ DynamoDB (Global Tables)                │
│ - users                       │ - live_locations (TTL: 24h)             │
│ - emergency_contacts          │ - active_sos (TTL: 7d)                  │
│ - medical_info                │ - geofence_events (TTL: 30d)            │
│ - trusted_circle              │ - risk_cache (TTL: 1h)                  │
│ - journey_history             │ - session_tokens (TTL: 1h)              │
│ - police_stations             │                                         │
│ - crime_data                  │                                         │
├───────────────────────────────┼─────────────────────────────────────────┤
│ S3 + KMS Encryption           │ ElastiCache (Redis)                     │
│ - evidence/{user}/{sos}/      │ - Heatmap cache                         │
│   - audio.enc                 │ - Route cache                           │
│   - video.enc                 │ - Session data                          │
│   - photos.enc                │ - API rate limits                       │
│ - fir_drafts/{sos_id}.pdf     │                                         │
└──────────────┬────────────────┴─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          AI/ML LAYER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ SageMaker (XGBoost)  │ Bedrock (Llama 3)  │ Polly/Transcribe │ Rekognition│
│ - Risk prediction    │ - FIR generation   │ - 12 languages   │ - Face blur│
│ - Route scoring      │ - Incident summary │ - Voice commands │ - Evidence │
│ - Pattern detection  │ - Report writing   │ - IVR prompts    │   analysis │
└──────────────┬───────────────┬──────────────┬─────────────────┬─────────┘
               │               │              │                 │
               ▼               ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       INTEGRATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ SNS (Notifications)  │ SQS (Queues)      │ EventBridge      │ Twilio    │
│ - SMS alerts         │ - Async FIR       │ - Scheduled      │ - SMS     │
│ - Push notifications │ - Evidence upload │   check-ins      │ - Voice   │
│ - Email (police)     │ - Heatmap refresh │ - Cron jobs      │ - IVR     │
└──────────────┬───────────────┬──────────────┬─────────────────┬─────────┘
               │               │              │                 │
               ▼               ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MONITORING & SECURITY LAYER                           │
├─────────────────────────────────────────────────────────────────────────┤
│ CloudWatch      │ CloudTrail    │ X-Ray         │ GuardDuty  │ IAM      │
│ - Metrics       │ - Audit logs  │ - Tracing     │ - Threats  │ - Roles  │
│ - Alarms        │ - Compliance  │ - Performance │ - Anomalies│ - Policies│
│ - Dashboards    │               │               │            │          │
└─────────────────────────────────────────────────────────────────────────┘

* sos-handler uses Lambda Provisioned Concurrency for zero cold start
```

### 1.4 Data Flow Overview

1. **User → CloudFront → API Gateway → Lambda → Database**
2. **SOS Trigger → Parallel Processing**:
   - Evidence recording → S3
   - Location tracking → DynamoDB
   - Police alert → SNS → SMS/Push
   - Family alert → SNS → SMS/Push/Call
   - FIR generation → Bedrock → S3
   - Risk analysis → SageMaker → DynamoDB

---

## 2. Technology Stack

### 2.1 Complete Technology Matrix

| Layer | Technology | Purpose | Justification |
|-------|------------|---------|---------------|
| **Frontend - Mobile** | React Native 0.72+ | Cross-platform mobile app | Single codebase for iOS/Android, 90% code reuse |
| | Redux Toolkit | State management | Predictable state, offline-first architecture |
| | NativeBase 3.4+ | UI component library | Accessible, customizable, Indian design system |
| | React Navigation 6+ | Navigation | Deep linking, state persistence |
| | Google Maps SDK | Maps and routing | Best coverage in India, real-time traffic |
| | MapMyIndia SDK | Alternative maps | Indian government preferred, better rural coverage |
| | React Native Background Geolocation | Location tracking | Battery-efficient background tracking |
| | React Native FS | File system | Offline evidence storage |
| | Realm Database | Local database | Offline-first, sync with backend |
| **Frontend - Web** | React 18+ | Admin dashboard | Component reusability, large ecosystem |
| | Next.js 14+ | SSR framework | SEO, performance, API routes |
| | Tailwind CSS | Styling | Rapid development, small bundle size |
| | Recharts | Data visualization | Heatmaps, analytics charts |
| | Mapbox GL JS | Web maps | Interactive heatmaps, custom styling |
| **Backend - Compute** | AWS Lambda | Serverless functions | Auto-scaling, pay-per-use, zero ops |
| | Lambda Provisioned Concurrency | Zero cold start for SOS | <10ms startup for critical endpoints |
| | Lambda@Edge | Edge computing | SDK distribution, low-latency state app integration |
| | Node.js 20.x | Lambda runtime | JavaScript ecosystem, async I/O |
| | Python 3.11 | ML Lambda runtime | SageMaker integration, data processing |
| **API Layer** | Amazon API Gateway (REST) | RESTful APIs | Managed service, auto-scaling, caching |
| | API Gateway (WebSocket) | Real-time communication | Live location, family coordination |
| | Amazon Connect | IVR system | Feature phone support, call recording |
| **Hosting/CI/CD** | AWS Amplify | Mobile app hosting | Auto-deploy from Git, preview environments |
| | AWS CodePipeline | CI/CD orchestration | Multi-stage deployments, approval gates |
| | AWS CodeBuild | Build service | Docker builds, parallel execution |
| | AWS CodeDeploy | Deployment | Blue-green, canary deployments |
| **Authentication** | Amazon Cognito | User identity | Federated identity, MFA, OAuth 2.0 |
| | Cognito User Pools | User directory | 50M users supported, password policies |
| | Cognito Identity Pools | Federated access | Aadhaar integration, social login |
| **Database - Relational** | Amazon RDS PostgreSQL 15 | Primary database | ACID compliance, PostGIS for geospatial |
| | RDS Multi-AZ | High availability | Automatic failover, <60s downtime |
| | RDS Read Replicas | Read scaling | Offload analytics queries |
| **Database - NoSQL** | Amazon DynamoDB | Live data, sessions | Single-digit ms latency, unlimited scale |
| | DynamoDB Global Tables | Multi-region sync | <1s replication across regions |
| | DynamoDB Streams | Change data capture | Trigger Lambda on data changes |
| | DynamoDB DAX | In-memory cache | Microsecond latency, 10x performance |
| **Cache** | Amazon ElastiCache (Redis) | Distributed cache | Heatmap cache, session store, rate limiting |
| | Redis Cluster Mode | Horizontal scaling | 500+ nodes, 340TB data |
| **Storage** | Amazon S3 | Object storage | Evidence, FIR PDFs, backups |
| | S3 Intelligent-Tiering | Cost optimization | Auto-move to cheaper tiers |
| | AWS KMS | Encryption keys | FIPS 140-2 validated, automatic rotation |
| | S3 Transfer Acceleration | Fast uploads | 50-500% faster uploads from India |
| **AI/ML - Training** | Amazon SageMaker | ML model training | Managed Jupyter, distributed training |
| | SageMaker XGBoost | Risk prediction model | Built-in algorithm, fast training |
| | SageMaker Model Monitor | Model drift detection | Automatic retraining triggers |
| **AI/ML - Inference** | SageMaker Endpoints | Real-time inference | Auto-scaling, A/B testing |
| | Amazon Bedrock (Llama 3) | LLM for FIR generation | Prompt engineering, context-aware |
| | Amazon Polly | Text-to-speech | 12 Indian languages, neural voices |
| | Amazon Transcribe | Speech-to-text | Real-time, custom vocabulary |
| | Amazon Rekognition | Image/video analysis | Face detection, content moderation |
| **Integration - Messaging** | Amazon SNS | Pub/sub messaging | SMS, push notifications, email |
| | Amazon SQS | Message queues | Async processing, decoupling |
| | Amazon SES | Email service | Police notifications, reports |
| **Integration - Events** | Amazon EventBridge | Event bus | Scheduled check-ins, cron jobs |
| | EventBridge Scheduler | Cron service | Heatmap refresh, model retraining |
| **Integration - Voice** | Amazon Connect | Contact center | IVR, call routing, recording |
| | Twilio | SMS/Voice backup | Multi-provider redundancy |
| | Exotel | India-specific telecom | Better operator integration |
| **Security** | AWS WAF | Web application firewall | SQL injection, XSS protection |
| | AWS Shield Advanced | DDoS protection | Layer 3/4/7, 24/7 response team |
| | AWS IAM | Identity management | Least privilege, role-based access |
| | AWS Secrets Manager | Secrets storage | Automatic rotation, encryption |
| | Amazon GuardDuty | Threat detection | ML-based anomaly detection |
| | AWS Certificate Manager | SSL/TLS certificates | Free certificates, auto-renewal |
| **Monitoring** | Amazon CloudWatch | Metrics and logs | 1-second metrics, log aggregation |
| | CloudWatch Alarms | Alerting | Auto-scaling triggers, PagerDuty integration |
| | AWS CloudTrail | Audit logging | API call history, compliance |
| | AWS X-Ray | Distributed tracing | Performance bottleneck identification |
| | CloudWatch Insights | Log analytics | SQL-like queries on logs |
| **Analytics** | Amazon Athena | SQL on S3 | Serverless, pay-per-query |
| | Amazon QuickSight | BI dashboards | Ministry dashboards, embedded analytics |
| | AWS Glue | ETL service | Data preparation for analytics |
| **Content Delivery** | Amazon CloudFront | CDN | <50ms latency, 450+ edge locations |
| | CloudFront Functions | Edge compute | Header manipulation, A/B testing |
| **Infrastructure** | AWS SAM | Serverless framework | Infrastructure as Code, local testing |
| | AWS CloudFormation | IaC | Stack management, drift detection |
| | AWS Systems Manager | Parameter store | Configuration management |

### 2.2 Programming Languages

| Language | Usage | Version |
|----------|-------|---------|
| **JavaScript/TypeScript** | Frontend (React Native, React), Backend (Node.js Lambda) | ES2022, TypeScript 5.0+ |
| **Python** | ML pipelines, data processing, SageMaker | Python 3.11 |
| **SQL** | Database queries, analytics | PostgreSQL 15, Athena (Presto) |
| **HCL** | Infrastructure as Code | Terraform (if used) |
| **YAML** | CI/CD pipelines, SAM templates | - |

### 2.3 Third-Party Services

| Service | Purpose | Fallback |
|---------|---------|----------|
| **Twilio** | SMS/Voice (primary) | AWS SNS, Exotel |
| **Exotel** | India telecom integration | Twilio, Amazon Connect |
| **Google Maps API** | Routing, geocoding | MapMyIndia |
| **MapMyIndia** | India-specific maps | Google Maps |
| **OpenCelliD** | Cell tower database | Operator APIs |
| **NCRB API** | Crime data | State police APIs |

---

## 3. Component Details

### 3.1 Mobile App Architecture

**Technology**: React Native 0.72+ with TypeScript

**Architecture Pattern**: Redux Toolkit + Redux-Saga for side effects

**Key Modules**:

```
src/
├── app/
│   ├── store.ts                 # Redux store configuration
│   ├── rootReducer.ts           # Combine reducers
│   └── rootSaga.ts              # Combine sagas
├── features/
│   ├── auth/
│   │   ├── authSlice.ts         # Auth state management
│   │   ├── authSaga.ts          # Login, register, MFA
│   │   └── screens/             # Login, Register screens
│   ├── sos/
│   │   ├── sosSlice.ts          # SOS state
│   │   ├── sosSaga.ts           # Trigger, cancel, status
│   │   ├── SOSButton.tsx        # Panic button component
│   │   └── screens/             # SOS status, history
│   ├── profile/
│   │   ├── profileSlice.ts      # User profile state
│   │   └── screens/             # Profile, edit, trusted circle
│   ├── routes/
│   │   ├── routeSlice.ts        # Safe route state
│   │   ├── MapScreen.tsx        # Map with safe routes
│   │   └── RouteComparison.tsx  # Route safety scores
│   ├── evidence/
│   │   ├── evidenceSlice.ts     # Evidence recording state
│   │   ├── SilentRecorder.ts    # Background recording
│   │   └── EvidenceUploader.ts  # Encrypted upload to S3
│   └── location/
│       ├── locationSlice.ts     # Location tracking state
│       ├── LocationTracker.ts   # Background geolocation
│       └── GeofenceManager.ts   # High-risk area alerts
├── services/
│   ├── api.ts                   # API client (Axios)
│   ├── websocket.ts             # WebSocket for live updates
│   ├── storage.ts               # Realm database
│   └── encryption.ts            # Client-side encryption
├── navigation/
│   └── AppNavigator.tsx         # React Navigation setup
└── utils/
    ├── permissions.ts           # Location, camera, mic permissions
    └── offline.ts               # Offline queue management
```

**State Management**:
- Redux Toolkit for global state
- Redux-Saga for async operations (API calls, location tracking)
- Redux-Persist for offline persistence
- Realm for local database (offline-first)

**Offline Capability**:
- Queue SOS triggers when offline (SMS fallback)
- Cache last 100 routes with safety scores
- Store user profile locally
- Sync when connection restored

**Maps Integration**:
- Google Maps SDK for routing
- Custom markers for police stations, safe zones
- Real-time traffic overlay
- Safety score heatmap layer

**Background Services**:
- Location tracking (every 30s when app active, every 5min in background)
- Silent evidence recording (continues even if app killed)
- Geofence monitoring (alerts when entering high-risk zones)

**Performance Optimizations**:
- Lazy loading of screens
- Image optimization (WebP format)
- Bundle size <50MB
- <2s cold start time

---

### 3.2 Backend Services (Lambda Functions)

#### 3.2.1 Authentication Service

**Function**: `auth-handler`  
**Runtime**: Node.js 20.x  
**Memory**: 512 MB  
**Timeout**: 30s  
**Concurrency**: 1000

**Responsibilities**:
- User registration with mobile OTP
- Login with JWT token generation
- MFA setup and verification
- Password reset
- Aadhaar integration (optional)

**API Endpoints**:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/mfa/setup`
- `POST /auth/mfa/verify`
- `POST /auth/password/reset`

**Dependencies**: Cognito, SNS (OTP), DynamoDB (session tokens)

---

#### 3.2.2 SOS Handler (Critical)

**Function**: `sos-handler`  
**Runtime**: Node.js 20.x  
**Memory**: 1024 MB  
**Timeout**: 60s  
**Provisioned Concurrency**: 100 (zero cold start)  
**Reserved Concurrency**: 500

**Responsibilities**:
- Trigger SOS with location detection
- Cancel SOS within 30s window
- Get SOS status
- Parallel processing:
  - Alert police via SNS
  - Alert trusted circle via SNS
  - Start evidence recording
  - Trigger FIR generation (async via SQS)
  - Update live location in DynamoDB
  - Log to CloudWatch

**API Endpoints**:
- `POST /sos/trigger`
- `POST /sos/cancel/{sosId}`
- `GET /sos/status/{sosId}`

**Performance Requirements**:
- <200ms total latency
- 10,000 concurrent SOS supported
- 99.99% success rate

**Error Handling**:
- Retry failed SMS 3 times
- Fallback to Twilio if SNS fails
- Store failed alerts in DLQ for manual processing

---

#### 3.2.3 Profile Manager

**Function**: `profile-manager`  
**Runtime**: Node.js 20.x  
**Memory**: 512 MB  
**Timeout**: 30s

**Responsibilities**:
- CRUD operations on user profile
- Sync profile across state apps
- Manage trusted circle (add/remove contacts)
- Update medical information
- Profile federation (cross-state access)

**API Endpoints**:
- `GET /profile`
- `PUT /profile`
- `POST /profile/trusted-circle`
- `DELETE /profile/trusted-circle/{contactId}`
- `GET /profile/federation/{sakhiId}` (for police access)

**Database**: RDS PostgreSQL (users, emergency_contacts, medical_info)

---

#### 3.2.4 Route Planner

**Function**: `route-planner`  
**Runtime**: Node.js 20.x  
**Memory**: 1024 MB  
**Timeout**: 10s

**Responsibilities**:
- Calculate safe routes using Google Maps API
- Score routes based on risk model
- Apply time-of-day adjustments
- Cache results in ElastiCache

**API Endpoints**:
- `POST /route/plan` (from, to, time)
- `GET /route/risk/{routeId}`

**Algorithm**:
1. Get 3 alternative routes from Google Maps
2. For each route segment (1km):
   - Query crime data from RDS
   - Get lighting data from OpenStreetMap
   - Calculate risk score using SageMaker model
3. Aggregate segment scores to route score
4. Return routes sorted by safety

**Caching**: 1-hour TTL in Redis for popular routes

---

#### 3.2.5 FIR Generator

**Function**: `fir-generator`  
**Runtime**: Python 3.11  
**Memory**: 2048 MB  
**Timeout**: 300s (5 min)

**Responsibilities**:
- Generate FIR draft using Bedrock (Llama 3)
- Attach evidence links from S3
- Convert to PDF format
- Send to police station email
- Store in S3 for user access

**Trigger**: SQS message from `sos-handler`

**Bedrock Prompt Template**:
```python
prompt = f"""
You are a legal assistant generating a First Information Report (FIR) 
under Section 154 of the Code of Criminal Procedure (CrPC).

User Details:
- Name: {user_name}
- Sakhi ID: {sakhi_id}
- Location: {location_address}
- Timestamp: {timestamp}

Incident Details:
- Type: Emergency SOS triggered
- GPS Coordinates: {lat}, {lng}
- Evidence: Audio recording, photos available

Generate a formal FIR in English following this structure:
1. Complainant details
2. Incident description
3. Location and time
4. Evidence attached
5. Request for immediate action

Keep it concise, factual, and legally compliant.
"""
```

**Output**: PDF stored at `s3://sakhi-firs/{sos_id}/fir_draft.pdf`

---

#### 3.2.6 Risk Analyzer

**Function**: `risk-analyzer`  
**Runtime**: Python 3.11  
**Memory**: 2048 MB  
**Timeout**: 30s

**Responsibilities**:
- Real-time risk scoring using SageMaker endpoint
- Heatmap data generation
- Pattern detection (following behavior)
- Proactive alerts for high-risk zones

**SageMaker Model**:
- Algorithm: XGBoost
- Input features (20):
  - Location (lat, lng)
  - Time of day (hour, day_of_week)
  - Crime history (last 30 days, 90 days, 1 year)
  - Police station distance
  - Street lighting score
  - Population density
  - User reports (crowdsourced)
  - Historical SOS count
  - Public transport availability
  - CCTV coverage
  - Previous incidents at location
  - Weather conditions
  - Event/festival data
  - Alcohol outlet density
  - School/college proximity
  - Commercial vs residential area
  - Road type (highway, street, alley)
  - Footfall (high, medium, low)
  - Emergency response time
  - User's personal history

- Output: Risk score (0-100)
  - 0-30: Low risk (green)
  - 31-60: Medium risk (yellow)
  - 61-80: High risk (orange)
  - 81-100: Critical risk (red)

**API Endpoints**:
- `POST /risk/analyze` (location, time)
- `GET /risk/heatmap/{area}` (district, city, state)

**Model Retraining**: Weekly with new incident data

---

#### 3.2.7 Relay Service

**Function**: `relay-service`  
**Runtime**: Node.js 20.x  
**Memory**: 512 MB  
**Timeout**: 30s

**Responsibilities**:
- Route SOS to correct police station based on jurisdiction
- Multi-channel alerting (SMS, push, voice call)
- Escalation if no response in 5 minutes
- Cross-state coordination

**Routing Logic**:
1. Detect current location (GPS or cell tower)
2. Query police_stations table for jurisdiction
3. Send alert to nearest station
4. Notify home state control room
5. Notify current state control room
6. Alert trusted circle

**Channels**:
- SMS via SNS (primary) / Twilio (fallback)
- Push notification via FCM/APNs
- Voice call via Amazon Connect (if no response in 2 min)

---

#### 3.2.8 Evidence Saver

**Function**: `evidence-saver`  
**Runtime**: Node.js 20.x  
**Memory**: 1024 MB  
**Timeout**: 300s

**Responsibilities**:
- Receive encrypted evidence from mobile app
- Store in S3 with KMS encryption
- Generate presigned URLs for police access
- Maintain chain of custody (SHA-256 hash)

**API Endpoints**:
- `POST /evidence/upload` (multipart form data)
- `GET /evidence/{sosId}` (police only)

**Storage Structure**:
```
s3://sakhi-evidence/
  {user_id}/
    {sos_id}/
      audio_001.enc (AES-256 encrypted)
      video_001.enc
      photo_001.enc
      metadata.json (timestamps, hashes)
```

**Security**:
- Client-side encryption before upload
- S3 bucket encryption with KMS
- Presigned URLs with 1-hour expiry
- Access logged in CloudTrail

---

#### 3.2.9 SDK Adapter

**Function**: `sdk-adapter`  
**Runtime**: Node.js 20.x  
**Memory**: 512 MB  
**Timeout**: 30s

**Responsibilities**:
- State app registration and API key generation
- Webhook relay for real-time events
- Rate limiting (1000 req/min per app)
- Usage analytics

**API Endpoints**:
- `POST /sdk/register` (state app onboarding)
- `POST /sdk/webhook` (event subscription)
- `GET /sdk/usage` (analytics)

**Events**:
- `sos.triggered` - SOS initiated in state
- `sos.resolved` - SOS marked safe
- `profile.updated` - User profile changed
- `fir.generated` - FIR created

---

#### 3.2.10 IVR Handler

**Function**: `ivr-handler`  
**Runtime**: Node.js 20.x  
**Memory**: 512 MB  
**Timeout**: 60s

**Responsibilities**:
- Handle Amazon Connect IVR flows
- Language selection (12 languages)
- Voice menu navigation
- Trigger SOS via voice command
- Call recording

**IVR Flow**:
```
1. User calls toll-free number
2. Language selection (Press 1 for Hindi, 2 for English, ...)
3. Main menu:
   - Press 1 to trigger SOS
   - Press 2 to add trusted contact
   - Press 3 to check SOS status
   - Press 9 for help
4. Execute action
5. Confirmation message
6. Hang up
```

**Voice Prompts**: Generated using Amazon Polly (neural voices)

---

#### 3.2.11 Location Tracker

**Function**: `location-tracker`  
**Runtime**: Node.js 20.x  
**Memory**: 256 MB  
**Timeout**: 10s

**Responsibilities**:
- Receive location updates from mobile app
- Store in DynamoDB with TTL (24 hours)
- Geofence monitoring
- Alert if entering high-risk zone

**API Endpoints**:
- `POST /location/update` (lat, lng, timestamp)
- `GET /location/history/{userId}` (last 24 hours)

**Geofencing**:
- Check if location within high-risk polygon
- Send proactive alert via SNS
- Log event in DynamoDB

---

#### 3.2.12 Alert Manager

**Function**: `alert-manager`  
**Runtime**: Node.js 20.x  
**Memory**: 512 MB  
**Timeout**: 30s

**Responsibilities**:
- Manage trusted circle alerts
- Scheduled check-ins
- Escalation logic
- Group coordination

**API Endpoints**:
- `POST /alert/trusted-circle` (send alert to all contacts)
- `POST /alert/check-in` (schedule check-in)
- `POST /alert/respond/{alertId}` (contact response)

**Escalation**:
- No response in 5 min → Call trusted circle
- No response in 15 min → Trigger SOS automatically
- No response in 30 min → Alert police

---

### 3.3 AI Services

#### 3.3.1 SageMaker Risk Prediction Model

**Model Type**: XGBoost Classifier  
**Training Data**: 5 years of NCRB crime data + state police data  
**Features**: 20 (listed in Risk Analyzer section)  
**Target**: Risk score (0-100)

**Training Pipeline**:
1. Data ingestion from RDS and S3
2. Feature engineering (time-based, geospatial)
3. Train/test split (80/20)
4. Hyperparameter tuning (Bayesian optimization)
5. Model training (distributed across 4 instances)
6. Model evaluation (accuracy, precision, recall)
7. Model deployment to SageMaker endpoint

**Inference**:
- Real-time endpoint with auto-scaling
- <100ms latency
- 1000 TPS capacity

**Monitoring**:
- Model drift detection via SageMaker Model Monitor
- Automatic retraining if accuracy drops below 85%

---

#### 3.3.2 Bedrock FIR Generation

**Model**: Llama 3 70B (via Amazon Bedrock)  
**Use Case**: Generate legal FIR drafts from incident data

**Prompt Engineering**:
- System prompt: Legal assistant role
- Context: User details, incident details, evidence
- Output format: Structured FIR following CrPC Section 154
- Temperature: 0.3 (low creativity, high consistency)
- Max tokens: 2000

**Post-processing**:
- Convert to PDF using ReportLab (Python)
- Add digital signature
- Attach evidence links

---

#### 3.3.3 Polly/Transcribe Language Support

**Amazon Polly** (Text-to-Speech):
- Languages: Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam
- Voice: Neural (Aditi for Hindi, Raveena for English)
- Use case: IVR prompts, voice alerts

**Amazon Transcribe** (Speech-to-Text):
- Languages: Same as Polly
- Custom vocabulary: Safety-related terms (SOS, help, emergency)
- Use case: Voice commands, evidence transcription

---

#### 3.3.4 Rekognition

**Use Cases**:
- Face detection in evidence photos (blur faces for privacy)
- Content moderation (remove inappropriate images)
- Object detection (weapons, vehicles)

**Privacy**:
- All processing done in India region
- No face data stored
- Only metadata (face detected: yes/no) stored

---

### 3.4 Integration SDK

**Distribution**: Lambda@Edge + npm package

**SDK Structure**:
```javascript
// npm package: @sakhi/sdk
import SakhiSDK from '@sakhi/sdk';

const sakhi = new SakhiSDK({
  apiKey: 'your-state-app-api-key',
  region: 'ap-south-1'
});

// Trigger SOS from state app
await sakhi.sos.trigger({
  userId: 'user-123',
  location: { lat: 12.9716, lng: 77.5946 }
});

// Subscribe to events
sakhi.on('sos.triggered', (event) => {
  console.log('SOS triggered:', event);
  // Update state app UI
});

// Get user profile
const profile = await sakhi.profile.get('SAKHI-KL-1234567890');
```

**10-Line Integration Example**:
```javascript
// State app integration (Kerala Pink Police)
import SakhiSDK from '@sakhi/sdk';

const sakhi = new SakhiSDK({ apiKey: process.env.SAKHI_API_KEY });

// When user triggers SOS in state app
app.post('/emergency', async (req, res) => {
  const { userId, location } = req.body;
  const sos = await sakhi.sos.trigger({ userId, location });
  res.json({ sosId: sos.id, status: 'Police notified' });
});
```

**Features**:
- Auto-retry with exponential backoff
- Webhook support for real-time events
- TypeScript definitions included
- <10KB bundle size

---

## 4. Data Flow Diagrams

### 4.1 User Registration Flow

```
Step 1: User opens app → Mobile App
Step 2: User enters mobile number → Mobile App validates format
Step 3: Mobile App → API Gateway → auth-handler Lambda
Step 4: auth-handler → Cognito: Create user
Step 5: auth-handler → SNS: Send OTP via SMS
Step 6: SNS → Twilio → User receives OTP
Step 7: User enters OTP → Mobile App
Step 8: Mobile App → API Gateway → auth-handler
Step 9: auth-handler → Cognito: Verify OTP
Step 10: auth-handler → RDS: Insert user record
Step 11: auth-handler → DynamoDB: Create session token
Step 12: auth-handler → Mobile App: Return JWT token + Sakhi ID
Step 13: Mobile App stores token in secure storage
Step 14: Mobile App navigates to Dashboard

AWS Services Used:
- API Gateway (REST)
- Lambda (auth-handler)
- Cognito (user pool)
- SNS (SMS)
- RDS PostgreSQL (users table)
- DynamoDB (session_tokens table)
```

---

### 4.2 Safe Route Planning Flow

```
Step 1: User enters destination → Mobile App
Step 2: Mobile App gets current location via GPS
Step 3: Mobile App → API Gateway → route-planner Lambda
Step 4: route-planner → ElastiCache: Check cache for route
Step 5: If cache miss:
  Step 5a: route-planner → Google Maps API: Get 3 alternative routes
  Step 5b: For each route:
    - route-planner → RDS: Query crime data for route segments
    - route-planner → OpenStreetMap: Get lighting data
    - route-planner → SageMaker Endpoint: Calculate risk score
  Step 5c: route-planner → ElastiCache: Cache results (TTL: 1 hour)
Step 6: route-planner → Mobile App: Return routes with safety scores
Step 7: Mobile App displays routes on map with color coding:
  - Green: Low risk (0-30)
  - Yellow: Medium risk (31-60)
  - Orange: High risk (61-80)
  - Red: Critical risk (81-100)
Step 8: User selects route
Step 9: Mobile App starts navigation with Google Maps SDK

AWS Services Used:
- API Gateway (REST)
- Lambda (route-planner)
- ElastiCache (Redis)
- RDS PostgreSQL (crime_data table)
- SageMaker (risk prediction endpoint)

External APIs:
- Google Maps Directions API
- OpenStreetMap Overpass API
```

---

### 4.3 SOS Emergency Flow (Parallel Processing)

```
Step 1: User triggers SOS (button press / voice / shake)
Step 2: Mobile App → API Gateway → sos-handler Lambda (Provisioned Concurrency)

PARALLEL BRANCH 1: Evidence Recording
Step 3a: Mobile App starts silent audio/video recording
Step 4a: Mobile App → S3: Upload encrypted evidence chunks (streaming)
Step 5a: S3 → Lambda (evidence-saver): Process uploaded evidence
Step 6a: evidence-saver → DynamoDB: Log evidence metadata

PARALLEL BRANCH 2: Location Tracking
Step 3b: Mobile App gets GPS location
Step 4b: sos-handler → DynamoDB: Insert active_sos record
Step 5b: Mobile App → WebSocket API: Start live location stream
Step 6b: WebSocket → location-tracker Lambda: Update location every 5s
Step 7b: location-tracker → DynamoDB: Update live_locations table

PARALLEL BRANCH 3: Police Notification
Step 3c: sos-handler → RDS: Query police_stations by jurisdiction
Step 4c: sos-handler → relay-service Lambda: Route alert
Step 5c: relay-service → SNS: Send SMS to police station
Step 6c: SNS → Twilio → Police receives SMS with:
  - User name, photo, Sakhi ID
  - GPS location + Google Maps link
  - Medical info (blood type, allergies)
  - Incident ID
Step 7c: relay-service → SES: Send email to police with details
Step 8c: relay-service → DynamoDB: Log alert sent

PARALLEL BRANCH 4: Family Alert
Step 3d: sos-handler → RDS: Query trusted_circle contacts
Step 4d: sos-handler → alert-manager Lambda: Send alerts
Step 5d: alert-manager → SNS: Send SMS to all contacts
Step 6d: alert-manager → FCM/APNs: Send push notifications
Step 7d: If no response in 2 min:
  - alert-manager → Amazon Connect: Initiate voice calls
Step 8d: alert-manager → DynamoDB: Log contact responses

PARALLEL BRANCH 5: FIR Generation (Async)
Step 3e: sos-handler → SQS: Queue FIR generation task
Step 4e: SQS → fir-generator Lambda (triggered async)
Step 5e: fir-generator → RDS: Get user profile + incident details
Step 6e: fir-generator → S3: Get evidence links
Step 7e: fir-generator → Bedrock (Llama 3): Generate FIR text
Step 8e: fir-generator → Python ReportLab: Convert to PDF
Step 9e: fir-generator → S3: Store FIR PDF
Step 10e: fir-generator → SNS: Send FIR to police email
Step 11e: fir-generator → Mobile App (push): FIR number sent

PARALLEL BRANCH 6: Risk Analysis
Step 3f: sos-handler → risk-analyzer Lambda: Analyze incident
Step 4f: risk-analyzer → SageMaker: Get risk score for location
Step 5f: risk-analyzer → DynamoDB: Update heatmap data
Step 6f: risk-analyzer → EventBridge: Trigger heatmap refresh

Step 7: sos-handler → Mobile App: Return SOS ID + confirmation
Step 8: Mobile App displays "Help is on the way" with:
  - SOS ID
  - Police ETA
  - Trusted circle notified count
  - Live location sharing active

Step 9: User can cancel SOS within 30 seconds:
  - Mobile App → sos-handler → Cancel all alerts
  - sos-handler → SNS: Send cancellation SMS
  - sos-handler → DynamoDB: Mark SOS as cancelled

AWS Services Used:
- API Gateway (REST + WebSocket)
- Lambda (sos-handler, relay-service, alert-manager, evidence-saver, 
  fir-generator, location-tracker, risk-analyzer)
- S3 (evidence storage)
- DynamoDB (active_sos, live_locations, alert_logs)
- RDS (users, trusted_circle, police_stations)
- SNS (SMS, push notifications)
- SES (email)
- SQS (async FIR generation)
- Amazon Connect (voice calls)
- Bedrock (FIR generation)
- SageMaker (risk analysis)
- EventBridge (heatmap refresh)

Performance:
- Total latency: <200ms (from trigger to first alert sent)
- Evidence upload: Streaming (no wait)
- FIR generation: Async (5 min)
- Location updates: Every 5s
```

---

### 4.4 Cross-State Profile Federation Flow

```
Scenario: Woman from Kerala (registered in Pink Police app) triggers SOS in Delhi

Step 1: User triggers SOS in Delhi
Step 2: Mobile App → API Gateway → sos-handler Lambda
Step 3: sos-handler detects location: Delhi (lat: 28.6139, lng: 77.2090)
Step 4: sos-handler → DynamoDB Global Tables: Get user profile
  - Primary region: Mumbai (home state: Kerala)
  - Replicated to: Delhi, Bangalore
  - Replication lag: <1 second
Step 5: sos-handler → RDS: Query police_stations WHERE state='Delhi'
Step 6: sos-handler finds nearest station: Connaught Place Police Station
Step 7: sos-handler → relay-service: Route alert to Delhi police
Step 8: relay-service → SNS: Send SMS to Delhi police with:
  - User profile from Kerala
  - Current location in Delhi
  - Sakhi ID: SAKHI-KL-1234567890
Step 9: relay-service → SNS: Notify Kerala control room (home state)
Step 10: relay-service → SNS: Notify Delhi control room (current state)
Step 11: Both states can access user profile via federation:
  - Delhi police → API Gateway → profile-manager Lambda
  - profile-manager → Cognito: Verify police credentials
  - profile-manager → DynamoDB: Get profile (replicated from Mumbai)
  - profile-manager → Delhi police: Return profile
Step 12: sos-handler → DynamoDB: Log cross-state SOS event
Step 13: sos-handler → EventBridge: Trigger analytics update

AWS Services Used:
- DynamoDB Global Tables (multi-region profile replication)
- API Gateway (REST)
- Lambda (sos-handler, relay-service, profile-manager)
- RDS (police_stations)
- SNS (cross-state notifications)
- Cognito (police authentication)
- EventBridge (analytics)

Key Feature: Profile available in <1s across all regions via Global Tables
```

---

### 4.5 Feature Phone IVR Flow

```
Step 1: User calls toll-free number: 1800-XXX-XXXX
Step 2: Call → Amazon Connect (IVR system)
Step 3: Amazon Connect → Lambda (ivr-handler): Get user by phone number
Step 4: ivr-handler → RDS: Query users WHERE mobile='+91XXXXXXXXXX'
Step 5: If user found:
  - Amazon Connect → Polly: "Namaste [User Name], aap Sakhi helpline par hain"
Step 6: Amazon Connect → Polly: Language selection prompt
  - "Press 1 for Hindi, 2 for English, 3 for Tamil..."
Step 7: User presses 1 (Hindi)
Step 8: Amazon Connect → Polly (Hindi voice): Main menu
  - "SOS ke liye 1 dabayen"
  - "Trusted contact jodne ke liye 2 dabayen"
  - "SOS status ke liye 3 dabayen"
  - "Madad ke liye 9 dabayen"
Step 9: User presses 1 (SOS)
Step 10: Amazon Connect → Lambda (ivr-handler): Trigger SOS
Step 11: ivr-handler → Cell tower API: Get approximate location
  - Accuracy: ~500m radius
Step 12: ivr-handler → sos-handler Lambda: Trigger SOS with cell tower location
Step 13: sos-handler executes full SOS flow (see 4.3)
Step 14: Amazon Connect → Polly: "Aapki SOS register ho gayi hai. Police aa rahi hai."
Step 15: Amazon Connect → User: Play confirmation message
Step 16: Amazon Connect → SMS (via SNS): Send confirmation SMS with SOS ID
Step 17: Amazon Connect: Start call recording (evidence)
Step 18: Call recording → S3: Store encrypted audio
Step 19: Amazon Connect: Keep line open for 5 minutes (user can speak to police)
Step 20: If police calls back:
  - Amazon Connect → Bridge call to user
Step 21: Call ends
Step 22: Amazon Connect → Lambda (ivr-handler): Log call details
Step 23: ivr-handler → DynamoDB: Store call metadata

AWS Services Used:
- Amazon Connect (IVR, call routing, recording)
- Lambda (ivr-handler, sos-handler)
- Polly (text-to-speech in 12 languages)
- RDS (users table)
- SNS (SMS confirmation)
- S3 (call recording storage)
- DynamoDB (call logs)

External APIs:
- Cell tower location API (OpenCelliD / operator API)

Performance:
- Call answer time: <2 seconds
- Language selection: <3 seconds
- SOS trigger: <10 seconds total
```

---

### 4.6 Scheduled Check-in Flow

```
Step 1: User sets check-in time (e.g., 10:00 PM)
Step 2: Mobile App → API Gateway → alert-manager Lambda
Step 3: alert-manager → EventBridge Scheduler: Create scheduled event
Step 4: alert-manager → DynamoDB: Store check-in details

At scheduled time (10:00 PM):
Step 5: EventBridge → alert-manager Lambda: Trigger check-in
Step 6: alert-manager → SNS: Send push notification to user
  - "Are you safe? Tap to confirm."
Step 7: alert-manager → SNS: Send SMS backup
  - "Reply SAFE to confirm check-in"

If user responds within 5 minutes:
Step 8a: User taps notification → Mobile App → alert-manager
Step 9a: alert-manager → DynamoDB: Mark check-in as confirmed
Step 10a: alert-manager → SNS: Send "I'm safe" message to trusted circle

If no response after 5 minutes:
Step 8b: alert-manager → SNS: Send reminder notification
Step 9b: alert-manager → SNS: Alert trusted circle
  - "[User Name] hasn't confirmed check-in"

If no response after 15 minutes:
Step 10b: alert-manager → Amazon Connect: Call user
Step 11b: If no answer:
  - alert-manager → Amazon Connect: Call trusted circle

If no response after 30 minutes:
Step 12b: alert-manager → sos-handler: Auto-trigger SOS
Step 13b: Full SOS flow executes (see 4.3)

AWS Services Used:
- EventBridge Scheduler (cron jobs)
- Lambda (alert-manager, sos-handler)
- SNS (push, SMS)
- Amazon Connect (voice calls)
- DynamoDB (check-in records)
```

---

### 4.7 Heatmap Generation Flow

```
Step 1: EventBridge Scheduler → risk-analyzer Lambda (daily at 2 AM)
Step 2: risk-analyzer → RDS: Query all SOS incidents (last 30 days)
Step 3: risk-analyzer → RDS: Query crime_data (NCRB + state police)
Step 4: risk-analyzer groups incidents by:
  - District
  - 1km x 1km grid cells
  - Time of day (morning, afternoon, evening, night)
Step 5: For each grid cell:
  - risk-analyzer → SageMaker: Calculate risk score
  - Inputs: Incident count, crime history, lighting, police presence
  - Output: Risk score (0-100)
Step 6: risk-analyzer → DynamoDB: Store heatmap data
  - Table: heatmap_cache
  - TTL: 24 hours
Step 7: risk-analyzer → S3: Store GeoJSON file for QuickSight
Step 8: risk-analyzer → EventBridge: Trigger QuickSight refresh

When user requests heatmap:
Step 9: Admin Dashboard → API Gateway → risk-analyzer Lambda
Step 10: risk-analyzer → DynamoDB: Get cached heatmap data
Step 11: risk-analyzer → Admin Dashboard: Return GeoJSON
Step 12: Admin Dashboard (Mapbox GL) renders heatmap with color gradient:
  - Green: Low risk (0-30)
  - Yellow: Medium risk (31-60)
  - Orange: High risk (61-80)
  - Red: Critical risk (81-100)

AWS Services Used:
- EventBridge Scheduler (daily refresh)
- Lambda (risk-analyzer)
- RDS (incidents, crime_data)
- SageMaker (risk scoring)
- DynamoDB (heatmap_cache)
- S3 (GeoJSON storage)
- QuickSight (ministry dashboards)
```

---

## 5. Database Schema

### 5.1 RDS PostgreSQL Schema

#### Table: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sakhi_id VARCHAR(50) UNIQUE NOT NULL, -- SAKHI-KL-1234567890
  mobile VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  date_of_birth DATE,
  home_state VARCHAR(2), -- KL, DL, MH, etc.
  languages TEXT[], -- ['hi', 'en', 'ta']
  aadhaar_hash VARCHAR(64), -- SHA-256 hash (privacy)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  cognito_user_id VARCHAR(255) UNIQUE
);

CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_sakhi_id ON users(sakhi_id);
CREATE INDEX idx_users_home_state ON users(home_state);
```

#### Table: `emergency_contacts`
```sql
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  relationship VARCHAR(50), -- mother, father, spouse, friend
  priority INT DEFAULT 1, -- 1 = primary, 2 = secondary
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
```

#### Table: `medical_info`
```sql
CREATE TABLE medical_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  blood_type VARCHAR(5), -- A+, B-, O+, etc.
  allergies TEXT[],
  medications TEXT[],
  chronic_conditions TEXT[],
  emergency_notes TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table: `trusted_circle`
```sql
CREATE TABLE trusted_circle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship VARCHAR(50),
  can_view_location BOOLEAN DEFAULT TRUE,
  can_receive_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

CREATE INDEX idx_trusted_circle_user_id ON trusted_circle(user_id);
```

#### Table: `journey_history`
```sql
CREATE TABLE journey_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_location GEOGRAPHY(POINT, 4326),
  end_location GEOGRAPHY(POINT, 4326),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  route_geojson JSONB, -- GeoJSON LineString
  safety_score INT, -- 0-100
  status VARCHAR(20), -- ongoing, completed, sos_triggered
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_journey_history_user_id ON journey_history(user_id);
CREATE INDEX idx_journey_history_start_time ON journey_history(start_time);
```

#### Table: `sos_incidents`
```sql
CREATE TABLE sos_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_id VARCHAR(50) UNIQUE NOT NULL, -- SOS-20260215-123456
  user_id UUID REFERENCES users(id),
  trigger_location GEOGRAPHY(POINT, 4326) NOT NULL,
  trigger_address TEXT,
  trigger_time TIMESTAMP NOT NULL DEFAULT NOW(),
  trigger_method VARCHAR(20), -- app, voice, sms, ivr
  status VARCHAR(20), -- active, resolved, cancelled, false_alarm
  resolution_time TIMESTAMP,
  police_station_id UUID REFERENCES police_stations(id),
  fir_number VARCHAR(100),
  evidence_s3_path TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sos_incidents_user_id ON sos_incidents(user_id);
CREATE INDEX idx_sos_incidents_trigger_time ON sos_incidents(trigger_time);
CREATE INDEX idx_sos_incidents_status ON sos_incidents(status);
CREATE INDEX idx_sos_incidents_location ON sos_incidents USING GIST(trigger_location);
```

#### Table: `police_stations`
```sql
CREATE TABLE police_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  district VARCHAR(100),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  phone VARCHAR(15),
  email VARCHAR(255),
  jurisdiction_polygon GEOGRAPHY(POLYGON, 4326),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_police_stations_location ON police_stations USING GIST(location);
CREATE INDEX idx_police_stations_state ON police_stations(state);
CREATE INDEX idx_police_stations_jurisdiction ON police_stations USING GIST(jurisdiction_polygon);
```

#### Table: `crime_data`
```sql
CREATE TABLE crime_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  crime_type VARCHAR(100), -- assault, harassment, theft, etc.
  incident_date DATE NOT NULL,
  time_of_day VARCHAR(20), -- morning, afternoon, evening, night
  severity INT, -- 1-5
  source VARCHAR(50), -- ncrb, state_police, user_report
  district VARCHAR(100),
  state VARCHAR(2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_crime_data_location ON crime_data USING GIST(location);
CREATE INDEX idx_crime_data_incident_date ON crime_data(incident_date);
CREATE INDEX idx_crime_data_state ON crime_data(state);
```

#### Table: `state_apps`
```sql
CREATE TABLE state_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit INT DEFAULT 1000, -- requests per minute
  created_at TIMESTAMP DEFAULT NOW(),
  last_sync TIMESTAMP
);

CREATE INDEX idx_state_apps_state ON state_apps(state);
CREATE INDEX idx_state_apps_api_key ON state_apps(api_key);
```

---

### 5.2 DynamoDB Tables

#### Table: `live_locations`
```javascript
{
  TableName: "live_locations",
  KeySchema: [
    { AttributeName: "user_id", KeyType: "HASH" },
    { AttributeName: "timestamp", KeyType: "RANGE" }
  ],
  AttributeDefinitions: [
    { AttributeName: "user_id", AttributeType: "S" },
    { AttributeName: "timestamp", AttributeType: "N" }
  ],
  TimeToLiveSpecification: {
    Enabled: true,
    AttributeName: "ttl" // 24 hours
  },
  BillingMode: "PAY_PER_REQUEST"
}

// Item structure:
{
  "user_id": "uuid",
  "timestamp": 1708012800, // Unix timestamp
  "latitude": 12.9716,
  "longitude": 77.5946,
  "accuracy": 10, // meters
  "speed": 5.5, // m/s
  "heading": 180, // degrees
  "source": "gps", // gps, cell_tower, ip
  "ttl": 1708099200 // 24 hours from now
}
```

#### Table: `active_sos`
```javascript
{
  TableName: "active_sos",
  KeySchema: [
    { AttributeName: "sos_id", KeyType: "HASH" }
  ],
  AttributeDefinitions: [
    { AttributeName: "sos_id", AttributeType: "S" },
    { AttributeName: "user_id", AttributeType: "S" },
    { AttributeName: "trigger_time", AttributeType: "N" }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "user_id-index",
      KeySchema: [
        { AttributeName: "user_id", KeyType: "HASH" },
        { AttributeName: "trigger_time", KeyType: "RANGE" }
      ]
    }
  ],
  TimeToLiveSpecification: {
    Enabled: true,
    AttributeName: "ttl" // 7 days
  },
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: "NEW_AND_OLD_IMAGES"
  }
}

// Item structure:
{
  "sos_id": "SOS-20260215-123456",
  "user_id": "uuid",
  "trigger_time": 1708012800,
  "location": {
    "lat": 12.9716,
    "lng": 77.5946,
    "address": "MG Road, Bangalore"
  },
  "status": "active", // active, resolved, cancelled
  "police_notified": true,
  "family_notified": true,
  "fir_generated": false,
  "evidence_urls": ["s3://..."],
  "alerts_sent": [
    { "type": "sms", "to": "+91XXXXXXXXXX", "status": "delivered" }
  ],
  "ttl": 1708617600 // 7 days
}
```

#### Table: `geofence_events`
```javascript
{
  TableName: "geofence_events",
  KeySchema: [
    { AttributeName: "user_id", KeyType: "HASH" },
    { AttributeName: "timestamp", KeyType: "RANGE" }
  ],
  TimeToLiveSpecification: {
    Enabled: true,
    AttributeName: "ttl" // 30 days
  }
}

// Item structure:
{
  "user_id": "uuid",
  "timestamp": 1708012800,
  "event_type": "entered", // entered, exited
  "zone_type": "high_risk", // high_risk, safe_zone
  "location": { "lat": 12.9716, "lng": 77.5946 },
  "risk_score": 85,
  "alert_sent": true,
  "ttl": 1710604800 // 30 days
}
```

#### Table: `risk_cache`
```javascript
{
  TableName: "risk_cache",
  KeySchema: [
    { AttributeName: "location_hash", KeyType: "HASH" }
  ],
  TimeToLiveSpecification: {
    Enabled: true,
    AttributeName: "ttl" // 1 hour
  }
}

// Item structure:
{
  "location_hash": "geohash_12.9716_77.5946", // Geohash for caching
  "risk_score": 45,
  "risk_factors": {
    "crime_density": 30,
    "lighting": 70,
    "police_presence": 80,
    "time_of_day": "night"
  },
  "calculated_at": 1708012800,
  "ttl": 1708016400 // 1 hour
}
```

#### Table: `session_tokens`
```javascript
{
  TableName: "session_tokens",
  KeySchema: [
    { AttributeName: "token_id", KeyType: "HASH" }
  ],
  TimeToLiveSpecification: {
    Enabled: true,
    AttributeName: "ttl" // 1 hour
  }
}

// Item structure:
{
  "token_id": "uuid",
  "user_id": "uuid",
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "device_id": "device-uuid",
  "ip_address": "103.x.x.x",
  "created_at": 1708012800,
  "ttl": 1708016400 // 1 hour
}
```

---

### 5.3 S3 Bucket Structure

#### Bucket: `sakhi-evidence`
```
sakhi-evidence/
├── {user_id}/
│   ├── {sos_id}/
│   │   ├── audio_001.enc          # AES-256 encrypted
│   │   ├── audio_002.enc
│   │   ├── video_001.enc
│   │   ├── photo_001.enc
│   │   ├── photo_002.enc
│   │   └── metadata.json          # Timestamps, hashes, chain of custody
│   │       {
│   │         "sos_id": "SOS-20260215-123456",
│   │         "files": [
│   │           {
│   │             "name": "audio_001.enc",
│   │             "type": "audio/aac",
│   │             "size": 1048576,
│   │             "sha256": "abc123...",
│   │             "timestamp": 1708012800,
│   │             "location": {"lat": 12.9716, "lng": 77.5946}
│   │           }
│   │         ]
│   │       }
```

**Encryption**: 
- Client-side encryption before upload (AES-256)
- S3 bucket encryption with KMS (SSE-KMS)
- Versioning enabled
- Lifecycle policy: Move to Glacier after 90 days

**Access Control**:
- User: Read-only via presigned URLs (1-hour expiry)
- Police: Read-only via presigned URLs (requires authentication)
- No public access

---

#### Bucket: `sakhi-firs`
```
sakhi-firs/
├── {sos_id}/
│   ├── fir_draft.pdf              # Generated by Bedrock + ReportLab
│   ├── fir_final.pdf              # After police review
│   └── evidence_links.json        # S3 URLs to evidence
```

**Retention**: 7 years (legal requirement)

---

#### Bucket: `sakhi-heatmaps`
```
sakhi-heatmaps/
├── national/
│   ├── 2026-02-15.geojson
│   └── 2026-02-14.geojson
├── state/
│   ├── KL/
│   │   └── 2026-02-15.geojson
│   └── DL/
│       └── 2026-02-15.geojson
└── district/
    ├── bangalore/
    │   └── 2026-02-15.geojson
```

**Update Frequency**: Daily at 2 AM

---

### 5.4 ElastiCache (Redis) Schema

#### Key Pattern: `route:{from_hash}:{to_hash}:{time}`
```
Value: JSON string
{
  "routes": [
    {
      "route_id": "route-1",
      "distance": 5.2, // km
      "duration": 15, // minutes
      "safety_score": 85,
      "polyline": "encoded_polyline",
      "risk_segments": [
        {"start": 0, "end": 1.5, "score": 90},
        {"start": 1.5, "end": 3.0, "score": 75}
      ]
    }
  ],
  "cached_at": 1708012800
}
TTL: 3600 seconds (1 hour)
```

#### Key Pattern: `heatmap:{area}:{date}`
```
Value: GeoJSON string
TTL: 86400 seconds (24 hours)
```

#### Key Pattern: `session:{user_id}`
```
Value: JSON string
{
  "user_id": "uuid",
  "name": "User Name",
  "sakhi_id": "SAKHI-KL-1234567890",
  "permissions": ["sos", "profile"]
}
TTL: 3600 seconds (1 hour)
```

#### Key Pattern: `rate_limit:{api_key}:{minute}`
```
Value: Integer (request count)
TTL: 60 seconds
```

---

## 6. API Design

### 6.1 Authentication APIs

#### POST /auth/register
Register a new user with mobile OTP verification.

**Request**:
```json
{
  "mobile": "+919876543210",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "date_of_birth": "1995-05-15",
  "home_state": "KL",
  "languages": ["hi", "en", "ml"]
}
```

**Response** (200 OK):
```json
{
  "status": "otp_sent",
  "message": "OTP sent to +919876543210",
  "session_id": "session-uuid",
  "expires_in": 300
}
```

---

#### POST /auth/verify-otp
Verify OTP and complete registration.

**Request**:
```json
{
  "session_id": "session-uuid",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "user": {
    "id": "user-uuid",
    "sakhi_id": "SAKHI-KL-1234567890",
    "name": "Priya Sharma",
    "mobile": "+919876543210"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh-token-uuid",
    "expires_in": 3600
  }
}
```

---

#### POST /auth/login
Login with mobile and password/OTP.

**Request**:
```json
{
  "mobile": "+919876543210",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "user": {
    "id": "user-uuid",
    "sakhi_id": "SAKHI-KL-1234567890",
    "name": "Priya Sharma"
  },
  "tokens": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_in": 3600
  }
}
```

---

### 6.2 Profile APIs

#### GET /profile
Get current user's profile.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "user-uuid",
    "sakhi_id": "SAKHI-KL-1234567890",
    "name": "Priya Sharma",
    "mobile": "+919876543210",
    "email": "priya@example.com",
    "photo_url": "https://cdn.sakhi.gov.in/photos/user-uuid.jpg",
    "home_state": "KL",
    "languages": ["hi", "en", "ml"]
  },
  "emergency_contacts": [
    {
      "id": "contact-uuid",
      "name": "Rajesh Sharma",
      "mobile": "+919876543211",
      "relationship": "father",
      "priority": 1
    }
  ],
  "medical_info": {
    "blood_type": "O+",
    "allergies": ["Penicillin"],
    "medications": ["None"],
    "chronic_conditions": []
  },
  "trusted_circle": [
    {
      "id": "circle-uuid",
      "name": "Anjali Verma",
      "mobile": "+919876543212",
      "relationship": "friend",
      "can_view_location": true
    }
  ]
}
```

---

#### PUT /profile
Update user profile.

**Request**:
```json
{
  "name": "Priya Sharma",
  "email": "priya.new@example.com",
  "photo_url": "https://cdn.sakhi.gov.in/photos/new.jpg",
  "languages": ["hi", "en", "ml", "ta"]
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

### 6.3 SOS APIs

#### POST /sos/trigger
Trigger emergency SOS.

**Request**:
```json
{
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "accuracy": 10,
    "source": "gps"
  },
  "trigger_method": "app",
  "notes": "Feeling unsafe, being followed"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "sos": {
    "sos_id": "SOS-20260215-123456",
    "trigger_time": "2026-02-15T18:30:00Z",
    "location": {
      "latitude": 12.9716,
      "longitude": 77.5946,
      "address": "MG Road, Bangalore, Karnataka"
    },
    "police_station": {
      "name": "MG Road Police Station",
      "phone": "+918022942222",
      "distance": 0.8
    },
    "alerts_sent": {
      "police": true,
      "family": true,
      "trusted_circle": 5
    },
    "cancellation_window": 30
  },
  "message": "Help is on the way. Police and family notified."
}
```

---

#### POST /sos/cancel/{sosId}
Cancel SOS within 30-second window.

**Request**:
```json
{
  "reason": "false_alarm"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "SOS cancelled. Cancellation alerts sent.",
  "sos_id": "SOS-20260215-123456"
}
```

---

#### GET /sos/status/{sosId}
Get SOS status and updates.

**Response** (200 OK):
```json
{
  "sos": {
    "sos_id": "SOS-20260215-123456",
    "status": "active",
    "trigger_time": "2026-02-15T18:30:00Z",
    "location": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "police_response": {
      "acknowledged": true,
      "eta": 5,
      "officer_name": "Inspector Ramesh Kumar"
    },
    "family_responses": [
      {
        "name": "Rajesh Sharma",
        "response": "On my way",
        "timestamp": "2026-02-15T18:31:00Z"
      }
    ],
    "fir_status": "generating",
    "evidence_uploaded": true
  }
}
```

---

### 6.4 Route Planning APIs

#### POST /route/plan
Get safe routes between two points.

**Request**:
```json
{
  "from": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "to": {
    "latitude": 12.9352,
    "longitude": 77.6245
  },
  "time": "2026-02-15T20:00:00Z",
  "preferences": {
    "avoid_high_risk": true,
    "prefer_well_lit": true
  }
}
```

**Response** (200 OK):
```json
{
  "routes": [
    {
      "route_id": "route-1",
      "safety_score": 85,
      "distance": 5.2,
      "duration": 15,
      "polyline": "encoded_polyline_string",
      "risk_level": "low",
      "highlights": [
        "Well-lit streets",
        "Police station nearby",
        "High footfall area"
      ],
      "risk_segments": [
        {
          "start_km": 0,
          "end_km": 1.5,
          "risk_score": 90,
          "reason": "Well-lit commercial area"
        },
        {
          "start_km": 1.5,
          "end_km": 3.0,
          "risk_score": 75,
          "reason": "Residential area, moderate lighting"
        }
      ]
    },
    {
      "route_id": "route-2",
      "safety_score": 65,
      "distance": 4.8,
      "duration": 12,
      "risk_level": "medium"
    },
    {
      "route_id": "route-3",
      "safety_score": 45,
      "distance": 4.2,
      "duration": 10,
      "risk_level": "high",
      "warnings": [
        "High crime area",
        "Poor lighting",
        "Isolated route"
      ]
    }
  ],
  "recommended_route": "route-1"
}
```

---

### 6.5 Evidence APIs

#### POST /evidence/upload
Upload encrypted evidence (audio/video/photo).

**Request** (multipart/form-data):
```
Content-Type: multipart/form-data

sos_id: SOS-20260215-123456
file: [binary data]
file_type: audio/aac
encryption_key: [encrypted AES key]
timestamp: 2026-02-15T18:30:00Z
location: {"lat": 12.9716, "lng": 77.5946}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "evidence": {
    "evidence_id": "evidence-uuid",
    "sos_id": "SOS-20260215-123456",
    "file_name": "audio_001.enc",
    "file_size": 1048576,
    "sha256": "abc123...",
    "uploaded_at": "2026-02-15T18:30:05Z",
    "s3_path": "s3://sakhi-evidence/user-uuid/sos-id/audio_001.enc"
  },
  "message": "Evidence uploaded and encrypted"
}
```

---

#### GET /evidence/{sosId}
Get evidence for SOS (police only).

**Headers**:
```
Authorization: Bearer {police_access_token}
```

**Response** (200 OK):
```json
{
  "sos_id": "SOS-20260215-123456",
  "evidence": [
    {
      "evidence_id": "evidence-uuid-1",
      "type": "audio",
      "file_name": "audio_001.enc",
      "duration": 120,
      "timestamp": "2026-02-15T18:30:00Z",
      "download_url": "https://presigned-url-expires-in-1h",
      "sha256": "abc123..."
    },
    {
      "evidence_id": "evidence-uuid-2",
      "type": "video",
      "file_name": "video_001.enc",
      "duration": 60,
      "timestamp": "2026-02-15T18:31:00Z",
      "download_url": "https://presigned-url-expires-in-1h"
    }
  ],
  "chain_of_custody": [
    {
      "action": "uploaded",
      "timestamp": "2026-02-15T18:30:05Z",
      "actor": "user-uuid"
    },
    {
      "action": "accessed",
      "timestamp": "2026-02-15T18:35:00Z",
      "actor": "police-officer-uuid"
    }
  ]
}
```

---

### 6.6 Heatmap APIs

#### GET /heatmap/{area}
Get safety heatmap for area.

**Parameters**:
- `area`: national | state/{state_code} | district/{district_name}
- `date`: YYYY-MM-DD (optional, defaults to today)
- `time_of_day`: morning | afternoon | evening | night (optional)

**Example**: `GET /heatmap/state/KL?date=2026-02-15&time_of_day=night`

**Response** (200 OK):
```json
{
  "area": "Kerala",
  "date": "2026-02-15",
  "time_of_day": "night",
  "geojson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [77.5946, 12.9716]
        },
        "properties": {
          "risk_score": 85,
          "incident_count": 5,
          "crime_types": ["harassment", "theft"],
          "color": "#FF0000"
        }
      }
    ]
  },
  "summary": {
    "total_incidents": 150,
    "high_risk_areas": 12,
    "medium_risk_areas": 35,
    "low_risk_areas": 100
  }
}
```

---

### 6.7 FIR APIs

#### POST /fir/generate
Generate FIR draft (triggered automatically by SOS, but can be manual).

**Request**:
```json
{
  "sos_id": "SOS-20260215-123456",
  "additional_details": "Suspect description: Male, 30s, blue shirt"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "fir": {
    "fir_number": "FIR-KA-BLR-2026-12345",
    "sos_id": "SOS-20260215-123456",
    "generated_at": "2026-02-15T18:35:00Z",
    "pdf_url": "https://presigned-url-to-fir-pdf",
    "status": "draft",
    "police_station": "MG Road Police Station"
  },
  "message": "FIR draft generated and sent to police"
}
```

---

#### GET /fir/{firNumber}
Get FIR details.

**Response** (200 OK):
```json
{
  "fir": {
    "fir_number": "FIR-KA-BLR-2026-12345",
    "sos_id": "SOS-20260215-123456",
    "complainant": {
      "name": "Priya Sharma",
      "sakhi_id": "SAKHI-KL-1234567890",
      "mobile": "+919876543210"
    },
    "incident": {
      "date": "2026-02-15",
      "time": "18:30:00",
      "location": "MG Road, Bangalore",
      "description": "Emergency SOS triggered. User reported feeling unsafe."
    },
    "evidence": [
      "Audio recording (2 min)",
      "Video recording (1 min)",
      "Photos (3)"
    ],
    "police_station": "MG Road Police Station",
    "status": "filed",
    "pdf_url": "https://presigned-url"
  }
}
```

---

### 6.8 SDK APIs (for State Apps)

#### POST /sdk/register
Register state app and get API key.

**Request**:
```json
{
  "app_name": "Kerala Pink Police",
  "state": "KL",
  "contact_email": "admin@pinkpolice.kerala.gov.in",
  "webhook_url": "https://pinkpolice.kerala.gov.in/webhook"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "app": {
    "app_id": "app-uuid",
    "app_name": "Kerala Pink Police",
    "state": "KL",
    "api_key": "sk_live_abc123...",
    "rate_limit": 1000,
    "webhook_url": "https://pinkpolice.kerala.gov.in/webhook"
  },
  "message": "App registered successfully. Keep API key secure."
}
```

---

#### POST /sdk/webhook
Subscribe to events (called by state apps).

**Request**:
```json
{
  "events": ["sos.triggered", "sos.resolved", "profile.updated"]
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "subscriptions": ["sos.triggered", "sos.resolved", "profile.updated"],
  "message": "Webhook subscriptions updated"
}
```

**Webhook Payload** (sent to state app):
```json
{
  "event": "sos.triggered",
  "timestamp": "2026-02-15T18:30:00Z",
  "data": {
    "sos_id": "SOS-20260215-123456",
    "user": {
      "sakhi_id": "SAKHI-KL-1234567890",
      "name": "Priya Sharma"
    },
    "location": {
      "latitude": 12.9716,
      "longitude": 77.5946,
      "state": "KA"
    }
  }
}
```

---

### 6.9 Error Responses

All APIs follow consistent error format:

**400 Bad Request**:
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Mobile number is required",
    "field": "mobile"
  }
}
```

**401 Unauthorized**:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired access token"
  }
}
```

**403 Forbidden**:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

**404 Not Found**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "SOS not found",
    "resource": "sos",
    "id": "SOS-20260215-123456"
  }
}
```

**429 Too Many Requests**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retry_after": 60
  }
}
```

**500 Internal Server Error**:
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again.",
    "request_id": "req-uuid"
  }
}
```

---

## 7. Security Design

### 7.1 Authentication & Authorization

#### 7.1.1 User Authentication

**Primary Method**: Amazon Cognito User Pools

**Flow**:
1. User registers with mobile number
2. OTP sent via SNS
3. User verifies OTP
4. Cognito creates user account
5. JWT tokens issued (access + refresh)

**Token Structure**:
```json
{
  "sub": "user-uuid",
  "sakhi_id": "SAKHI-KL-1234567890",
  "cognito:groups": ["users"],
  "iss": "https://cognito-idp.ap-south-1.amazonaws.com/...",
  "exp": 1708016400,
  "iat": 1708012800
}
```

**Multi-Factor Authentication (MFA)**:
- SMS OTP (mandatory for first login)
- TOTP (optional, via authenticator app)
- Biometric (fingerprint/face on mobile)

**Session Management**:
- Access token: 1 hour expiry
- Refresh token: 30 days expiry
- Stored in DynamoDB with TTL
- Revocable via logout API

---

#### 7.1.2 Police Authentication

**Method**: Cognito Identity Pools + IAM roles

**Flow**:
1. Police officer logs in via state police portal
2. Portal authenticates with state identity provider
3. Cognito federates identity
4. IAM role assumed: `SakhiPoliceRole`
5. Temporary credentials issued (1 hour)

**Permissions**:
- Read user profiles during active SOS
- Access evidence with audit logging
- Update SOS status
- Generate FIR

**Audit**:
- All police access logged in CloudTrail
- Real-time alerts for suspicious access patterns
- Monthly audit reports to Ministry

---

#### 7.1.3 State App Authentication

**Method**: API Keys + OAuth 2.0

**API Key Format**: `sk_live_{state_code}_{random_32_chars}`

**Rate Limiting**:
- 1000 requests/minute per app
- Enforced via API Gateway + ElastiCache
- Burst: 2000 requests

**Scopes**:
- `sos:read` - Read SOS data
- `sos:write` - Trigger SOS
- `profile:read` - Read user profiles
- `webhook:subscribe` - Subscribe to events

---

### 7.2 Data Encryption

#### 7.2.1 Encryption at Rest

| Data Type | Encryption Method | Key Management |
|-----------|-------------------|----------------|
| **RDS PostgreSQL** | AES-256 (AWS managed) | AWS KMS |
| **DynamoDB** | AES-256 (AWS managed) | AWS KMS |
| **S3 Evidence** | Client-side AES-256 + SSE-KMS | User key + KMS |
| **S3 FIRs** | SSE-KMS | AWS KMS |
| **ElastiCache** | AES-256 in-transit encryption | N/A |
| **EBS Volumes** | AES-256 | AWS KMS |
| **Backups** | AES-256 | AWS KMS |

**KMS Key Hierarchy**:
```
Master Key (AWS managed)
├── Data Key 1 (RDS)
├── Data Key 2 (DynamoDB)
├── Data Key 3 (S3 Evidence)
└── Data Key 4 (S3 FIRs)
```

**Key Rotation**: Automatic annual rotation

---

#### 7.2.2 Encryption in Transit

- **TLS 1.3** for all API communication
- **Certificate Pinning** in mobile app
- **Perfect Forward Secrecy** (PFS) enabled
- **HSTS** (HTTP Strict Transport Security) enforced

**Certificate Management**:
- AWS Certificate Manager (ACM)
- Auto-renewal before expiry
- Wildcard cert: `*.sakhi.gov.in`

---

#### 7.2.3 Client-Side Encryption (Evidence)

**Algorithm**: AES-256-GCM

**Flow**:
1. Mobile app generates random AES key (256-bit)
2. Evidence encrypted with AES key
3. AES key encrypted with user's public key (RSA-2048)
4. Encrypted evidence + encrypted key uploaded to S3
5. Police access: Decrypt AES key with user's private key (stored in KMS)

**Key Storage**:
- User private key: AWS KMS (never leaves AWS)
- User public key: Stored in user profile

---

### 7.3 API Security

#### 7.3.1 AWS WAF Rules

| Rule | Purpose | Action |
|------|---------|--------|
| **Rate Limiting** | Max 100 req/min per IP | Block |
| **SQL Injection** | Detect SQL patterns in input | Block |
| **XSS** | Detect script tags | Block |
| **Geo-Blocking** | Allow only India IPs | Block others |
| **Bot Detection** | Block known bad bots | Block |
| **Size Limit** | Max 10MB request body | Block |

**Custom Rules**:
- Block requests without User-Agent
- Block requests with suspicious headers
- Allow only HTTPS

---

#### 7.3.2 API Gateway Security

**Throttling**:
- Account-level: 10,000 req/sec
- Per-API: 1,000 req/sec
- Per-user: 100 req/sec

**Request Validation**:
- JSON schema validation
- Required headers check
- Content-Type validation

**CORS**:
```json
{
  "allowOrigins": ["https://sakhi.gov.in", "https://admin.sakhi.gov.in"],
  "allowMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowHeaders": ["Authorization", "Content-Type"],
  "maxAge": 3600
}
```

---

#### 7.3.3 Lambda Security

**IAM Roles** (Least Privilege):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:*:table/active_sos"
    },
    {
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "arn:aws:sns:ap-south-1:*:sakhi-alerts"
    }
  ]
}
```

**Environment Variables**:
- Encrypted with KMS
- Stored in AWS Secrets Manager
- Rotated monthly

**VPC Configuration**:
- Lambda functions in private subnets
- NAT Gateway for internet access
- Security groups: Allow only necessary ports

---

### 7.4 Privacy & Compliance

#### 7.4.1 Data Minimization

**Principle**: Collect only necessary data

**Implementation**:
- No social media data collected
- Aadhaar optional (only hash stored)
- Location data: 24-hour TTL
- Evidence: 90-day retention (configurable)

---

#### 7.4.2 User Consent

**Consent Types**:
- Location tracking: Explicit opt-in
- Evidence recording: Automatic during SOS
- Data sharing with police: Automatic during SOS
- Analytics: Opt-in

**Consent Management**:
- Stored in user profile
- Revocable anytime
- Audit trail maintained

---

#### 7.4.3 Right to Erasure

**Process**:
1. User requests account deletion
2. 30-day grace period (can cancel)
3. After 30 days:
   - User profile deleted
   - Evidence anonymized (user ID removed)
   - FIRs retained (legal requirement)
   - Analytics data anonymized

**Exceptions**:
- Active SOS: Cannot delete until resolved
- Legal hold: Cannot delete if under investigation

---

#### 7.4.4 Data Localization

**Compliance**: India Data Protection Bill

**Implementation**:
- All data stored in AWS India regions (Mumbai, Delhi, Bangalore)
- No cross-border data transfer
- State data isolated in separate databases
- Backups also in India regions

---

### 7.5 Threat Mitigation

#### 7.5.1 DDoS Protection

**AWS Shield Standard**: Automatic (free)
- Layer 3/4 protection
- SYN/UDP flood protection

**AWS Shield Advanced**: Enabled for critical endpoints
- Layer 7 protection
- 24/7 DDoS Response Team (DRT)
- Cost protection

**CloudFront**: Absorbs traffic spikes at edge

---

#### 7.5.2 Intrusion Detection

**Amazon GuardDuty**: Enabled

**Monitored Threats**:
- Unusual API calls
- Compromised credentials
- Cryptocurrency mining
- Backdoor communication
- Data exfiltration

**Response**:
- Automatic alerts to security team
- Lambda function to block suspicious IPs
- Incident logged in CloudTrail

---

#### 7.5.3 Vulnerability Management

**Automated Scanning**:
- AWS Inspector: Weekly scans of Lambda functions
- Snyk: Daily scans of dependencies
- OWASP ZAP: Monthly penetration testing

**Patch Management**:
- Lambda runtimes: Auto-update to latest
- Dependencies: Automated PRs via Dependabot
- OS patches: Managed by AWS (serverless)

---

#### 7.5.4 Incident Response

**Playbook**:
1. **Detection**: GuardDuty alert → PagerDuty → Security team
2. **Containment**: Isolate affected resources, block IPs
3. **Investigation**: CloudTrail logs, X-Ray traces
4. **Remediation**: Patch vulnerability, rotate credentials
5. **Recovery**: Restore from backup if needed
6. **Post-Mortem**: Document incident, update playbook

**CERT-In Reporting**: Automated within 6 hours

---

### 7.6 Audit & Compliance

#### 7.6.1 Audit Logging

**CloudTrail**: All API calls logged

**Logged Events**:
- User authentication
- SOS triggers
- Evidence access
- Profile updates
- Police access to user data
- Admin actions

**Retention**: 7 years (compliance requirement)

**Immutability**: CloudTrail logs stored in S3 with Object Lock

---

#### 7.6.2 Compliance Monitoring

**AWS Config**: Continuous compliance monitoring

**Rules**:
- S3 buckets must have encryption enabled
- RDS must have backup enabled
- Lambda functions must be in VPC
- IAM users must have MFA enabled

**Non-Compliance**: Automatic alerts + remediation

---

#### 7.6.3 Security Audits

**Frequency**:
- Internal: Monthly
- External: Quarterly (CERT-In certified auditor)
- Penetration testing: Bi-annually

**Certifications** (Target):
- ISO 27001: Year 1
- SOC 2 Type II: Year 2
- MEITY empanelment: Year 1

---

## 8. Scalability and Performance

### 8.1 Auto-Scaling Strategy

#### 8.1.1 Lambda Concurrency

**SOS Handler** (Critical):
- Reserved Concurrency: 500
- Provisioned Concurrency: 100 (zero cold start)
- Auto-scaling: Up to 1000 concurrent executions
- Burst: 3000 executions/minute

**Other Functions**:
- Unreserved Concurrency: 1000 (shared pool)
- Auto-scaling based on demand
- CloudWatch alarms at 80% utilization

**Throttling Strategy**:
- SOS endpoints: Never throttled (reserved concurrency)
- Non-critical endpoints: Throttle at 1000 req/sec
- State app APIs: 1000 req/min per app

---

#### 8.1.2 DynamoDB Auto-Scaling

**Tables**: `live_locations`, `active_sos`, `geofence_events`

**Configuration**:
```json
{
  "read_capacity": {
    "min": 100,
    "max": 10000,
    "target_utilization": 70
  },
  "write_capacity": {
    "min": 100,
    "max": 10000,
    "target_utilization": 70
  }
}
```

**On-Demand Mode**: Enabled for unpredictable workloads

**Global Tables**: Multi-region replication
- Mumbai (primary)
- Delhi (replica)
- Bangalore (replica)
- Replication lag: <1 second

---

#### 8.1.3 RDS Scaling

**Read Replicas**: 3 replicas for read-heavy queries
- Analytics queries → Read replicas
- Write operations → Primary instance

**Vertical Scaling**:
- Current: db.r6g.xlarge (4 vCPU, 32 GB RAM)
- Scale up to: db.r6g.4xlarge (16 vCPU, 128 GB RAM)

**Connection Pooling**: RDS Proxy
- Max connections: 1000
- Connection reuse
- Automatic failover

---

#### 8.1.4 ElastiCache Scaling

**Cluster Mode**: Enabled

**Configuration**:
- Node type: cache.r6g.large (2 vCPU, 13.07 GB RAM)
- Shards: 3
- Replicas per shard: 2
- Total nodes: 9 (3 primary + 6 replicas)

**Auto-scaling**:
- CPU > 70%: Add shard
- Memory > 80%: Add shard
- Max shards: 15

---

### 8.2 Cold Start Mitigation

#### 8.2.1 Provisioned Concurrency

**SOS Handler**:
- 100 warm instances always ready
- <10ms startup time
- Cost: ~$50/month per instance

**Justification**: SOS is life-critical, zero cold start required

---

#### 8.2.2 Lambda Optimization

**Techniques**:
- Minimize package size (<50MB)
- Use Lambda layers for shared dependencies
- Lazy load non-critical modules
- Keep functions in VPC only if necessary
- Use ARM64 (Graviton2) for 20% better performance

**Cold Start Benchmarks**:
- Node.js 20.x: ~200ms
- Python 3.11: ~300ms
- With Provisioned Concurrency: <10ms

---

### 8.3 Caching Strategy

#### 8.3.1 CloudFront (CDN)

**Cached Content**:
- Static assets (JS, CSS, images)
- API responses (GET requests with Cache-Control)
- Heatmap GeoJSON files

**TTL**:
- Static assets: 1 year
- API responses: 5 minutes
- Heatmaps: 1 hour

**Cache Invalidation**:
- Automatic on deployment
- Manual via CloudFront API

---

#### 8.3.2 ElastiCache (Redis)

**Cached Data**:
- User sessions (1 hour TTL)
- Route calculations (1 hour TTL)
- Heatmap data (24 hour TTL)
- API rate limits (1 minute TTL)

**Cache Hit Ratio Target**: >90%

**Eviction Policy**: LRU (Least Recently Used)

---

#### 8.3.3 DynamoDB DAX

**Use Case**: Microsecond latency for hot data

**Cached Tables**:
- `active_sos` (read-heavy during SOS)
- `live_locations` (real-time tracking)

**Configuration**:
- Node type: dax.r5.large
- Cluster size: 3 nodes
- TTL: 5 minutes

**Performance**:
- Without DAX: 5-10ms
- With DAX: <1ms (microseconds)

---

### 8.4 Load Testing Strategy

#### 8.4.1 Test Scenarios

**Scenario 1: Normal Load**
- 10,000 concurrent users
- 100 SOS/minute
- 1,000 route requests/minute
- Duration: 1 hour

**Scenario 2: Peak Load**
- 100,000 concurrent users
- 1,000 SOS/minute
- 10,000 route requests/minute
- Duration: 30 minutes

**Scenario 3: Spike Load**
- 0 → 50,000 users in 1 minute
- Simulate mass event (festival, disaster)
- Duration: 15 minutes

**Scenario 4: Sustained Load**
- 50,000 concurrent users
- 500 SOS/minute
- Duration: 24 hours

---

#### 8.4.2 Load Testing Tools

**Primary**: AWS Distributed Load Testing Solution
- Fargate-based load generators
- Distributed across regions
- Real-time metrics

**Secondary**: Artillery.io
- Scenario-based testing
- WebSocket support
- CI/CD integration

**Monitoring During Tests**:
- CloudWatch metrics (latency, errors, throttles)
- X-Ray traces (bottleneck identification)
- RDS Performance Insights
- DynamoDB metrics

---

#### 8.4.3 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **SOS Response Time** | <200ms | P95 |
| **API Response Time** | <500ms | P95 |
| **App Launch Time** | <2s | P95 |
| **Route Calculation** | <2s | P95 |
| **Evidence Upload** | <30s | 10MB file on 4G |
| **Concurrent SOS** | 10,000/sec | Sustained |
| **Concurrent Users** | 1M+ | Sustained |
| **Error Rate** | <0.1% | All requests |
| **Availability** | 99.95% | SOS endpoints |

---

### 8.5 Database Optimization

#### 8.5.1 RDS PostgreSQL

**Indexing Strategy**:
```sql
-- Frequently queried columns
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_sakhi_id ON users(sakhi_id);

-- Geospatial queries
CREATE INDEX idx_sos_location ON sos_incidents USING GIST(trigger_location);
CREATE INDEX idx_police_jurisdiction ON police_stations USING GIST(jurisdiction_polygon);

-- Time-based queries
CREATE INDEX idx_sos_trigger_time ON sos_incidents(trigger_time DESC);
CREATE INDEX idx_crime_incident_date ON crime_data(incident_date DESC);

-- Composite indexes
CREATE INDEX idx_sos_user_time ON sos_incidents(user_id, trigger_time DESC);
```

**Query Optimization**:
- Use EXPLAIN ANALYZE for slow queries
- Avoid SELECT *
- Use prepared statements
- Batch inserts for bulk data

**Partitioning**:
```sql
-- Partition sos_incidents by month
CREATE TABLE sos_incidents_2026_02 PARTITION OF sos_incidents
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

**Vacuum & Analyze**: Automated daily

---

#### 8.5.2 DynamoDB

**Partition Key Design**:
- `live_locations`: user_id (high cardinality)
- `active_sos`: sos_id (unique)
- `geofence_events`: user_id (high cardinality)

**Sort Key Design**:
- `live_locations`: timestamp (range queries)
- `geofence_events`: timestamp (range queries)

**Global Secondary Indexes**:
```javascript
// Query SOS by user
{
  IndexName: "user_id-index",
  KeySchema: [
    { AttributeName: "user_id", KeyType: "HASH" },
    { AttributeName: "trigger_time", KeyType: "RANGE" }
  ]
}
```

**Best Practices**:
- Use batch operations (BatchGetItem, BatchWriteItem)
- Avoid hot partitions
- Use sparse indexes
- Enable TTL for temporary data

---

### 8.6 Network Optimization

#### 8.6.1 Multi-Region Architecture

**Regions**:
- Primary: ap-south-1 (Mumbai)
- Secondary: ap-south-2 (Hyderabad)
- Tertiary: ap-southeast-1 (Singapore, for disaster recovery)

**Routing**: Route 53 with latency-based routing

**Failover**:
- Health checks every 30 seconds
- Automatic failover to secondary region
- RTO: <5 minutes

---

#### 8.6.2 Content Delivery

**CloudFront**:
- 450+ edge locations worldwide
- 13 edge locations in India
- <50ms latency for static assets

**S3 Transfer Acceleration**:
- Enabled for evidence uploads
- 50-500% faster uploads from India
- Uses CloudFront edge locations

---

#### 8.6.3 API Optimization

**Compression**: Gzip enabled (reduces payload by 70%)

**Pagination**: Limit 100 items per page

**Field Selection**: Allow clients to specify fields
```
GET /profile?fields=name,mobile,sakhi_id
```

**Batch APIs**: Reduce round trips
```
POST /batch
{
  "requests": [
    { "method": "GET", "url": "/profile" },
    { "method": "GET", "url": "/sos/status/SOS-123" }
  ]
}
```

---

## 9. Deployment Architecture

### 9.1 Multi-AZ Deployment

#### 9.1.1 High Availability Architecture

```
Region: ap-south-1 (Mumbai)

Availability Zone A          Availability Zone B          Availability Zone C
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  Lambda Functions   │     │  Lambda Functions   │     │  Lambda Functions   │
│  (Auto-distributed) │     │  (Auto-distributed) │     │  (Auto-distributed) │
│                     │     │                     │     │                     │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│                     │     │                     │     │                     │
│  RDS Primary        │────▶│  RDS Standby        │     │                     │
│  (Active)           │     │  (Sync Replication) │     │                     │
│                     │     │                     │     │                     │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│                     │     │                     │     │                     │
│  ElastiCache        │     │  ElastiCache        │     │  ElastiCache        │
│  Primary Shard 1    │     │  Replica Shard 1    │     │  Replica Shard 1    │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                           │                           │
         └───────────────────────────┴───────────────────────────┘
                                     │
                          Application Load Balancer
                          (Cross-AZ load balancing)
                                     │
                                CloudFront
```

**Benefits**:
- No single point of failure
- Automatic failover (<60 seconds)
- Zero downtime deployments
- 99.95% availability SLA

---

### 9.2 CI/CD Pipeline

#### 9.2.1 Pipeline Architecture

```
Developer → Git Push → GitHub
                         │
                         ▼
                   GitHub Actions
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    Unit Tests      Lint/Format    Security Scan
    (Jest)          (ESLint)       (Snyk)
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                   Build & Package
                   (SAM build)
                         │
                         ▼
                   Deploy to Dev
                   (AWS SAM)
                         │
                         ▼
                   Integration Tests
                   (Postman/Newman)
                         │
                    ┌────┴────┐
                    │ Success? │
                    └────┬────┘
                         │ Yes
                         ▼
                   Deploy to Staging
                   (Blue-Green)
                         │
                         ▼
                   Smoke Tests
                         │
                    ┌────┴────┐
                    │ Success? │
                    └────┬────┘
                         │ Yes
                         ▼
                   Manual Approval
                   (GitHub PR Review)
                         │
                         ▼
                   Deploy to Production
                   (Canary: 10% → 50% → 100%)
                         │
                         ▼
                   Monitor (15 min)
                         │
                    ┌────┴────┐
                    │ Healthy? │
                    └────┬────┘
                         │ Yes
                         ▼
                   Complete Deployment
```

---

#### 9.2.2 GitHub Actions Workflow

```yaml
name: SAKHI CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/setup-sam@v2
      - run: sam build
      - run: sam package --output-template-file packaged.yaml
      - uses: actions/upload-artifact@v3
        with:
          name: packaged-template
          path: packaged.yaml

  deploy-dev:
    needs: build
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: actions/download-artifact@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      - run: sam deploy --template-file packaged.yaml --stack-name sakhi-dev

  integration-test:
    needs: deploy-dev
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run test:integration

  deploy-staging:
    needs: integration-test
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v3
      - uses: aws-actions/configure-aws-credentials@v2
      - run: sam deploy --template-file packaged.yaml --stack-name sakhi-staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v3
      - uses: aws-actions/configure-aws-credentials@v2
      - run: |
          sam deploy \
            --template-file packaged.yaml \
            --stack-name sakhi-prod \
            --parameter-overrides DeploymentPreference=Canary10Percent5Minutes
```

---

### 9.3 Infrastructure as Code

#### 9.3.1 AWS SAM Template (Excerpt)

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: SAKHI - National Women's Safety Grid

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 30
    MemorySize: 512
    Environment:
      Variables:
        STAGE: !Ref Stage
        REGION: !Ref AWS::Region
    Tracing: Active
    Tags:
      Project: SAKHI
      ManagedBy: SAM

Parameters:
  Stage:
    Type: String
    Default: dev
    AllowedValues: [dev, staging, prod]

Resources:
  # API Gateway
  SakhiApi:
    Type: AWS::Serverless::Api
    Properties:
      Name: !Sub sakhi-api-${Stage}
      StageName: !Ref Stage
      Cors:
        AllowOrigin: "'https://sakhi.gov.in'"
        AllowMethods: "'GET,POST,PUT,DELETE'"
        AllowHeaders: "'Content-Type,Authorization'"
      Auth:
        DefaultAuthorizer: CognitoAuthorizer
        Authorizers:
          CognitoAuthorizer:
            UserPoolArn: !GetAtt UserPool.Arn
      TracingEnabled: true
      MethodSettings:
        - ResourcePath: '/*'
          HttpMethod: '*'
          LoggingLevel: INFO
          DataTraceEnabled: true
          MetricsEnabled: true

  # SOS Handler (Critical - Provisioned Concurrency)
  SosHandlerFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub sakhi-sos-handler-${Stage}
      CodeUri: src/handlers/sos/
      Handler: index.handler
      MemorySize: 1024
      Timeout: 60
      ReservedConcurrentExecutions: 500
      ProvisionedConcurrencyConfig:
        ProvisionedConcurrentExecutions: 100
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref ActiveSosTable
        - SNSPublishMessagePolicy:
            TopicName: !GetAtt AlertTopic.TopicName
        - SQSSendMessagePolicy:
            QueueName: !GetAtt FirQueue.QueueName
      Events:
        TriggerSos:
          Type: Api
          Properties:
            RestApiId: !Ref SakhiApi
            Path: /sos/trigger
            Method: POST
        CancelSos:
          Type: Api
          Properties:
            RestApiId: !Ref SakhiApi
            Path: /sos/cancel/{sosId}
            Method: POST
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Canary10Percent5Minutes
        Alarms:
          - !Ref SosHandlerErrorAlarm

  # DynamoDB Table
  ActiveSosTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub sakhi-active-sos-${Stage}
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: sos_id
          AttributeType: S
        - AttributeName: user_id
          AttributeType: S
        - AttributeName: trigger_time
          AttributeType: N
      KeySchema:
        - AttributeName: sos_id
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: user_id-index
          KeySchema:
            - AttributeName: user_id
              KeyType: HASH
            - AttributeName: trigger_time
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      TimeToLiveSpecification:
        Enabled: true
        AttributeName: ttl
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Project
          Value: SAKHI

  # CloudWatch Alarm
  SosHandlerErrorAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub sakhi-sos-handler-errors-${Stage}
      AlarmDescription: Alert on SOS handler errors
      MetricName: Errors
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 60
      EvaluationPeriods: 1
      Threshold: 5
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: FunctionName
          Value: !Ref SosHandlerFunction
      AlarmActions:
        - !Ref AlertTopic

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub https://${SakhiApi}.execute-api.${AWS::Region}.amazonaws.com/${Stage}
  
  SosHandlerArn:
    Description: SOS Handler Lambda ARN
    Value: !GetAtt SosHandlerFunction.Arn
```

---

### 9.4 Deployment Strategies

#### 9.4.1 Blue-Green Deployment

**Process**:
1. Deploy new version (Green) alongside current (Blue)
2. Run smoke tests on Green
3. Switch 100% traffic to Green
4. Monitor for 15 minutes
5. If healthy: Delete Blue
6. If unhealthy: Rollback to Blue (instant)

**Use Case**: Non-critical functions (profile-manager, route-planner)

---

#### 9.4.2 Canary Deployment

**Process**:
1. Deploy new version
2. Route 10% traffic to new version
3. Monitor for 5 minutes
4. If healthy: Route 50% traffic
5. Monitor for 5 minutes
6. If healthy: Route 100% traffic
7. If unhealthy at any stage: Automatic rollback

**Use Case**: Critical functions (sos-handler, relay-service)

**CloudWatch Alarms**:
- Error rate > 1%: Rollback
- Latency > 500ms (P95): Rollback
- Throttles > 10: Rollback

---

#### 9.4.3 Rolling Deployment

**Process**:
1. Update 1 instance at a time
2. Wait for health check
3. Move to next instance
4. Repeat until all updated

**Use Case**: RDS read replicas, ElastiCache nodes

---

### 9.5 Rollback Strategy

#### 9.5.1 Automatic Rollback

**Triggers**:
- CloudWatch alarm breach
- Deployment failure
- Health check failure

**Process**:
1. CloudWatch alarm triggers
2. CodeDeploy stops deployment
3. Traffic routed back to previous version
4. Incident logged
5. Team notified via PagerDuty

**Time to Rollback**: <2 minutes

---

#### 9.5.2 Manual Rollback

**Process**:
```bash
# Rollback Lambda function
aws lambda update-alias \
  --function-name sakhi-sos-handler-prod \
  --name live \
  --function-version 42

# Rollback SAM stack
sam deploy \
  --template-file previous-version.yaml \
  --stack-name sakhi-prod \
  --no-confirm-changeset
```

---

### 9.6 Environment Management

#### 9.6.1 Environment Separation

| Environment | Purpose | Data | Users |
|-------------|---------|------|-------|
| **Development** | Feature development | Synthetic | Developers |
| **Staging** | Pre-production testing | Anonymized production copy | QA team |
| **Production** | Live system | Real user data | All users |

**Isolation**:
- Separate AWS accounts
- Separate VPCs
- Separate databases
- Separate KMS keys

---

#### 9.6.2 Configuration Management

**AWS Systems Manager Parameter Store**:

```
/sakhi/dev/database/host
/sakhi/dev/database/port
/sakhi/dev/api/google-maps-key
/sakhi/staging/database/host
/sakhi/prod/database/host
```

**Secrets Manager** (for sensitive data):
```
/sakhi/prod/database/password
/sakhi/prod/api/twilio-auth-token
/sakhi/prod/kms/evidence-key
```

**Access Control**:
- Dev: Developers have read access
- Staging: QA team has read access
- Prod: Only CI/CD pipeline has access

---

## 10. Monitoring and Observability

### 10.1 CloudWatch Metrics

#### 10.1.1 Lambda Metrics

**Standard Metrics**:
- Invocations
- Errors
- Duration (P50, P95, P99)
- Throttles
- Concurrent Executions
- Iterator Age (for stream-based functions)

**Custom Metrics**:
```javascript
// In Lambda function
const { CloudWatch } = require('@aws-sdk/client-cloudwatch');
const cloudwatch = new CloudWatch();

await cloudwatch.putMetricData({
  Namespace: 'SAKHI',
  MetricData: [
    {
      MetricName: 'SOSResponseTime',
      Value: responseTime,
      Unit: 'Milliseconds',
      Dimensions: [
        { Name: 'Environment', Value: 'prod' },
        { Name: 'Function', Value: 'sos-handler' }
      ]
    }
  ]
});
```

**Alarms**:
```yaml
SosHandlerErrorAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: sakhi-sos-handler-errors
    MetricName: Errors
    Namespace: AWS/Lambda
    Statistic: Sum
    Period: 60
    EvaluationPeriods: 1
    Threshold: 5
    ComparisonOperator: GreaterThanThreshold
    AlarmActions:
      - !Ref PagerDutyTopic

SosHandlerLatencyAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: sakhi-sos-handler-latency
    MetricName: Duration
    Namespace: AWS/Lambda
    ExtendedStatistic: p95
    Period: 60
    EvaluationPeriods: 2
    Threshold: 500
    ComparisonOperator: GreaterThanThreshold
```

---

#### 10.1.2 API Gateway Metrics

**Metrics**:
- Count (total requests)
- 4XXError (client errors)
- 5XXError (server errors)
- Latency (P50, P95, P99)
- IntegrationLatency (backend latency)
- CacheHitCount
- CacheMissCount

**Dashboard**:
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApiGateway", "Count", { "stat": "Sum" }],
          [".", "4XXError", { "stat": "Sum" }],
          [".", "5XXError", { "stat": "Sum" }]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "ap-south-1",
        "title": "API Gateway Requests"
      }
    }
  ]
}
```

---

#### 10.1.3 DynamoDB Metrics

**Metrics**:
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- UserErrors (throttling)
- SystemErrors
- SuccessfulRequestLatency

**Alarms**:
- Throttled requests > 10: Scale up
- Latency > 100ms (P95): Investigate
- User errors > 5%: Alert

---

#### 10.1.4 RDS Metrics

**Metrics**:
- CPUUtilization
- DatabaseConnections
- FreeableMemory
- ReadLatency / WriteLatency
- ReadThroughput / WriteThroughput
- ReplicaLag (for read replicas)

**Performance Insights**:
- Top SQL queries by execution time
- Wait events analysis
- Database load (average active sessions)

---

### 10.2 CloudWatch Logs

#### 10.2.1 Log Groups

```
/aws/lambda/sakhi-sos-handler-prod
/aws/lambda/sakhi-profile-manager-prod
/aws/lambda/sakhi-route-planner-prod
/aws/apigateway/sakhi-api-prod
/aws/rds/instance/sakhi-db-prod/error
/aws/rds/instance/sakhi-db-prod/slowquery
```

**Retention**: 30 days (cost optimization)

**Archival**: Export to S3 after 30 days (7-year retention)

---

#### 10.2.2 Structured Logging

**Format**: JSON

```javascript
// Logger utility
const logger = {
  info: (message, context) => {
    console.log(JSON.stringify({
      level: 'INFO',
      message,
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      ...context
    }));
  },
  error: (message, error, context) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      ...context
    }));
  }
};

// Usage
logger.info('SOS triggered', {
  userId: 'user-123',
  sosId: 'SOS-20260215-123456',
  location: { lat: 12.9716, lng: 77.5946 }
});
```

---

#### 10.2.3 Log Insights Queries

**Query 1: SOS Response Time**
```sql
fields @timestamp, sosId, responseTime
| filter @message like /SOS triggered/
| stats avg(responseTime), max(responseTime), min(responseTime) by bin(5m)
```

**Query 2: Error Analysis**
```sql
fields @timestamp, @message, error.message
| filter level = "ERROR"
| stats count() by error.message
| sort count desc
```

**Query 3: Top Users by SOS Count**
```sql
fields userId, sosId
| filter @message like /SOS triggered/
| stats count() as sosCount by userId
| sort sosCount desc
| limit 10
```

---

### 10.3 AWS X-Ray Tracing

#### 10.3.1 Distributed Tracing

**Enabled for**:
- All Lambda functions
- API Gateway
- DynamoDB calls
- S3 operations
- SNS/SQS

**Trace Example**:
```
SOS Trigger Request (200ms total)
├─ API Gateway (5ms)
├─ Lambda: sos-handler (180ms)
│  ├─ DynamoDB: GetItem (10ms)
│  ├─ DynamoDB: PutItem (15ms)
│  ├─ SNS: Publish (police alert) (50ms)
│  ├─ SNS: Publish (family alert) (45ms)
│  └─ SQS: SendMessage (FIR queue) (10ms)
└─ API Gateway response (15ms)
```

**Annotations** (for filtering):
```javascript
const AWSXRay = require('aws-xray-sdk-core');

AWSXRay.captureFunc('sos-trigger', (subsegment) => {
  subsegment.addAnnotation('userId', userId);
  subsegment.addAnnotation('sosId', sosId);
  subsegment.addAnnotation('state', 'KL');
  
  // Business logic
  
  subsegment.close();
});
```

**Service Map**: Visual representation of service dependencies

---

### 10.4 CloudTrail Audit Logs

#### 10.4.1 Logged Events

**API Calls**:
- All AWS API calls (Lambda, DynamoDB, S3, etc.)
- User authentication (Cognito)
- IAM role assumptions
- KMS key usage

**Data Events**:
- S3 object-level operations (evidence access)
- DynamoDB item-level operations (profile access)

**Retention**: 7 years (compliance)

**Immutability**: S3 Object Lock enabled

---

#### 10.4.2 Security Monitoring

**GuardDuty Findings**:
- Unusual API calls
- Compromised credentials
- Cryptocurrency mining
- Data exfiltration

**Automated Response**:
```python
# Lambda function triggered by GuardDuty finding
def lambda_handler(event, context):
    finding = event['detail']
    severity = finding['severity']
    
    if severity >= 7:  # High or Critical
        # Block suspicious IP
        waf.update_ip_set(
            Name='BlockedIPs',
            Addresses=[finding['service']['action']['networkConnectionAction']['remoteIpDetails']['ipAddressV4']]
        )
        
        # Notify security team
        sns.publish(
            TopicArn=SECURITY_TOPIC_ARN,
            Subject=f"GuardDuty Alert: {finding['type']}",
            Message=json.dumps(finding, indent=2)
        )
```

---

### 10.5 Dashboards

#### 10.5.1 Operational Dashboard (CloudWatch)

**Widgets**:
1. **SOS Metrics**
   - Total SOS triggered (last 24h)
   - Active SOS count
   - Average response time
   - Success rate

2. **API Performance**
   - Requests per minute
   - Error rate (4XX, 5XX)
   - Latency (P50, P95, P99)

3. **Lambda Health**
   - Invocations
   - Errors
   - Throttles
   - Concurrent executions

4. **Database Performance**
   - RDS CPU utilization
   - DynamoDB consumed capacity
   - Connection count
   - Query latency

5. **Alerts**
   - Active alarms
   - Recent incidents

**Access**: Operations team, on-call engineers

---

#### 10.5.2 Business Dashboard (QuickSight)

**Datasets**:
- SOS incidents (from RDS)
- User registrations (from RDS)
- Heatmap data (from S3)
- State-wise statistics

**Visualizations**:
1. **National Heatmap**
   - Interactive map with risk scores
   - Filter by date, time, state

2. **SOS Trends**
   - Line chart: SOS count over time
   - Bar chart: SOS by state
   - Pie chart: SOS by trigger method

3. **User Growth**
   - Line chart: Registrations over time
   - Bar chart: Users by state
   - Pie chart: Smartphone vs feature phone

4. **Response Metrics**
   - Average police response time
   - FIR generation rate
   - Evidence collection rate

5. **State Comparison**
   - Table: State-wise metrics
   - Ranking by safety score

**Access**: Ministry officials, state coordinators

**Refresh**: Daily at 2 AM

---

#### 10.5.3 Mobile App Analytics (Mixpanel)

**Events Tracked**:
- App opened
- User registered
- SOS triggered
- Route planned
- Evidence recorded
- Profile updated

**User Properties**:
- State
- Device type (smartphone/feature phone)
- App version
- Language preference

**Funnels**:
1. Registration funnel
   - App opened → Registration started → OTP sent → OTP verified → Profile completed

2. SOS funnel
   - SOS triggered → Police notified → Family notified → Evidence uploaded → FIR generated

**Retention Analysis**:
- Day 1, 7, 30 retention
- Cohort analysis by state

---

### 10.6 Alerting

#### 10.6.1 Alert Channels

**PagerDuty**: Critical alerts (24/7 on-call)
- SOS handler errors
- Database failures
- API Gateway 5XX errors > 1%

**Slack**: Warning alerts (business hours)
- High latency
- Throttling
- Capacity warnings

**Email**: Informational alerts
- Daily summary
- Weekly reports
- Monthly metrics

---

#### 10.6.2 Alert Severity Levels

| Severity | Response Time | Examples |
|----------|---------------|----------|
| **P0 - Critical** | 15 minutes | SOS handler down, database failure |
| **P1 - High** | 1 hour | High error rate, significant latency |
| **P2 - Medium** | 4 hours | Moderate latency, capacity warnings |
| **P3 - Low** | Next business day | Minor issues, optimization opportunities |

---

#### 10.6.3 On-Call Rotation

**Schedule**:
- Primary on-call: 1 week rotation
- Secondary on-call: Backup
- Escalation: Engineering manager

**Runbooks**: Documented procedures for common incidents
- SOS handler failure
- Database connection exhaustion
- API Gateway throttling
- S3 upload failures

---

### 10.7 Cost Monitoring

#### 10.7.1 AWS Cost Explorer

**Tags**:
- Project: SAKHI
- Environment: dev/staging/prod
- Component: api/database/storage/ml

**Budgets**:
- Monthly budget: ₹10 lakh (prod)
- Alert at 80% utilization
- Alert at 100% utilization

**Cost Allocation**:
- Lambda: 40%
- RDS: 25%
- DynamoDB: 15%
- S3: 10%
- Other: 10%

---

#### 10.7.2 Cost Optimization

**Strategies**:
- Use Savings Plans for Lambda (20% discount)
- Reserved Instances for RDS (40% discount)
- S3 Intelligent-Tiering (automatic cost optimization)
- DynamoDB on-demand (pay per request)
- CloudFront caching (reduce origin requests)
- Lambda ARM64 (20% better price-performance)

**Monitoring**:
- Weekly cost review
- Identify unused resources
- Right-size over-provisioned resources

---

## 11. Assumptions and Dependencies

### 11.1 Technical Assumptions

#### 11.1.1 AWS Service Availability

**Assumption**: AWS services maintain 99.9%+ uptime

**Services**:
- Lambda: 99.95% SLA
- API Gateway: 99.95% SLA
- DynamoDB: 99.99% SLA (Global Tables)
- RDS Multi-AZ: 99.95% SLA
- S3: 99.99% durability, 99.9% availability

**Mitigation**:
- Multi-AZ deployment
- Multi-region for critical data (DynamoDB Global Tables)
- Automatic failover
- Regular disaster recovery drills

---

#### 11.1.2 Network Connectivity

**Assumption**: Users have intermittent internet connectivity

**Reality**:
- Urban areas: 4G/5G (reliable)
- Rural areas: 2G/3G (unreliable)
- Remote areas: No connectivity

**Mitigation**:
- Offline-first mobile app architecture
- SMS/IVR fallback for feature phones
- Queue SOS triggers when offline
- Cell tower triangulation when GPS unavailable

---

#### 11.1.3 Device Capabilities

**Assumption**: Wide range of device capabilities

**Smartphone Users**:
- Android 8.0+ (95% coverage)
- iOS 13.0+ (98% coverage)
- 2GB+ RAM
- GPS, camera, microphone

**Feature Phone Users**:
- 2G/3G support
- SMS capability
- Voice calls
- No internet

**Mitigation**:
- Lightweight app (<50MB)
- Progressive enhancement
- Full feature phone support via SMS/IVR

---

### 11.2 Data Availability Assumptions

#### 11.2.1 Crime Data

**Assumption**: Historical crime data available from NCRB and state police

**Expected Data**:
- NCRB: National crime statistics (annual)
- State Police: Real-time incident data (via APIs)
- Format: CSV, JSON, or database access

**Reality Check**:
- NCRB data: Publicly available (1-year lag)
- State police APIs: Varies by state (some have, some don't)

**Mitigation**:
- Start with NCRB data
- Crowdsource safety data from users
- Partner with NGOs for ground-level data
- Use proxy indicators (lighting, police presence)

---

#### 11.2.2 Police Station Data

**Assumption**: Complete database of police stations with jurisdiction polygons

**Expected Data**:
- Name, address, phone, email
- GPS coordinates
- Jurisdiction boundaries (polygons)

**Reality Check**:
- Basic data available from government websites
- Jurisdiction polygons: May need manual mapping

**Mitigation**:
- Start with point locations
- Gradually add jurisdiction polygons
- Use Voronoi diagrams for initial jurisdiction mapping
- Crowdsource corrections from police

---

#### 11.2.3 Cell Tower Data

**Assumption**: Cell tower location database available for triangulation

**Sources**:
- OpenCelliD (open-source database)
- Telecom operator APIs (requires partnership)

**Accuracy**: 500m-2km radius

**Mitigation**:
- Use OpenCelliD as baseline
- Partner with operators for better accuracy
- Combine with IP geolocation
- Use last known GPS location as fallback

---

### 11.3 Integration Dependencies

#### 11.3.1 State Government Cooperation

**Assumption**: State governments will integrate their apps with SAKHI

**Requirements**:
- MoU signing
- API access to state systems
- Data sharing agreements
- Joint marketing

**Timeline**:
- Year 1: 20 states
- Year 2: All 28 states + 8 UTs

**Risks**:
- Political resistance
- Technical incompatibility
- Data privacy concerns

**Mitigation**:
- Central government mandate
- Pilot programs with willing states
- Comprehensive SDK (easy integration)
- Transparent privacy policies

---

#### 11.3.2 Telecom Operator Partnerships

**Assumption**: Operators will support toll-free SMS and priority routing

**Requirements**:
- Toll-free number allocation (DoT)
- SMS short code (56767)
- Priority routing for emergency messages
- Cell tower location data access

**Partners**:
- Airtel
- Jio
- Vodafone-Idea
- BSNL

**Risks**:
- Operator delays
- Cost negotiations
- Technical integration challenges

**Mitigation**:
- Early engagement with operators
- Government pressure (if needed)
- Multi-operator redundancy
- Fallback to regular SMS

---

#### 11.3.3 Third-Party APIs

**Google Maps API**:
- Assumption: 99.9% uptime
- Rate limit: 100,000 requests/day (can increase)
- Cost: $5 per 1000 requests (after free tier)
- Fallback: MapMyIndia

**MapMyIndia API**:
- Assumption: Better rural coverage in India
- Rate limit: 50,000 requests/day
- Cost: Negotiated government rate
- Fallback: Google Maps

**Twilio**:
- Assumption: 99.95% uptime for SMS
- Rate limit: 100 messages/second
- Cost: ₹0.50 per SMS
- Fallback: AWS SNS, Exotel

**Exotel**:
- Assumption: Better India telecom integration
- Rate limit: 50 calls/second
- Cost: ₹0.50 per minute
- Fallback: Amazon Connect

---

### 11.4 Regulatory Dependencies

#### 11.4.1 Data Protection Compliance

**Assumption**: India Data Protection Bill will be enacted

**Requirements**:
- Data localization (all data in India)
- User consent management
- Right to erasure
- Data breach notification (72 hours)

**Status**: Bill pending in Parliament

**Mitigation**:
- Design for compliance from day 1
- Follow GDPR as baseline
- Regular legal reviews
- Privacy by design

---

#### 11.4.2 Telecom Regulations

**Assumption**: TRAI approval for SMS/IVR services

**Requirements**:
- DLT (Distributed Ledger Technology) registration
- Sender ID registration
- Content template approval
- Spam compliance

**Timeline**: 2-3 months

**Mitigation**:
- Apply early
- Use registered telecom aggregators
- Comply with TRAI guidelines

---

#### 11.4.3 Police Procedures

**Assumption**: Auto-FIR generation will be accepted by police

**Requirements**:
- Compliance with CrPC Section 154
- Digital signature validity
- Evidence admissibility
- Police training

**Risks**:
- Resistance to automation
- Legal challenges
- Training requirements

**Mitigation**:
- Legal review of FIR format
- Pilot with willing police stations
- Comprehensive training program
- Manual override option

---

### 11.5 Capacity Assumptions

#### 11.5.1 User Growth

**Assumptions**:
- Year 1: 10M users (5M smartphone + 5M feature phone)
- Year 2: 50M users
- Year 5: 100M users

**Basis**:
- India has 500M+ women
- 20% adoption in Year 5 is realistic
- Government push will accelerate adoption

**Validation**:
- Monitor actual growth
- Adjust infrastructure accordingly
- Plan for 2x peak capacity

---

#### 11.5.2 SOS Volume

**Assumptions**:
- Year 1: 100K SOS/year (27 SOS/hour avg, 100 SOS/hour peak)
- Year 2: 1M SOS/year (270 SOS/hour avg, 1000 SOS/hour peak)
- Year 5: 10M SOS/year (2700 SOS/hour avg, 10000 SOS/hour peak)

**Basis**:
- 1% of users trigger SOS per year
- Peak during festivals, events

**Infrastructure**:
- Lambda: 10,000 concurrent SOS supported
- DynamoDB: Unlimited scale
- SNS: 100,000 messages/second

---

#### 11.5.3 Storage Requirements

**Assumptions**:
- Evidence per SOS: 10MB avg (audio + video + photos)
- FIR per SOS: 1MB (PDF)
- Total Year 1: 100K SOS × 11MB = 1.1TB
- Total Year 5: 10M SOS × 11MB = 110TB

**S3 Costs**:
- Standard: $0.023/GB/month
- Glacier (after 90 days): $0.004/GB/month
- Year 1: ~$300/month
- Year 5: ~$5,000/month (with lifecycle policies)

---

### 11.6 Performance Assumptions

#### 11.6.1 Response Time Targets

**Assumptions**:
- SOS response: <200ms (P95)
- API response: <500ms (P95)
- Route calculation: <2s (P95)

**Validation**:
- Load testing before launch
- Continuous monitoring
- Optimize bottlenecks

---

#### 11.6.2 Availability Targets

**Assumptions**:
- SOS endpoints: 99.95% uptime (21.9 min/month downtime)
- General app: 99.9% uptime (43.8 min/month downtime)

**Calculation**:
- Multi-AZ: 99.95% (AWS SLA)
- Multi-region: 99.99% (if needed)

**Validation**:
- Monthly uptime reports
- Incident post-mortems
- Continuous improvement

---

### 11.7 Cost Assumptions

#### 11.7.1 Infrastructure Costs

**Assumptions** (Year 1, 10M users):
- Lambda: ₹20 lakh/year
- RDS: ₹15 lakh/year
- DynamoDB: ₹10 lakh/year
- S3: ₹5 lakh/year
- Other (SNS, SQS, CloudWatch): ₹10 lakh/year
- Total: ₹60 lakh/year (~$75K)

**Basis**:
- 100K SOS/year
- 1M API requests/day
- 1TB storage

**Validation**:
- Monthly cost reviews
- Optimize based on actual usage

---

#### 11.7.2 Third-Party Costs

**Assumptions** (Year 1):
- Twilio SMS: ₹25 lakh/year (5M SMS × ₹0.50)
- Google Maps: ₹10 lakh/year (2M requests/month)
- Exotel IVR: ₹5 lakh/year (10K hours × ₹50)
- Total: ₹40 lakh/year (~$50K)

**Negotiation**:
- Government rates (30-50% discount)
- Volume discounts
- Multi-year contracts

---

#### 11.7.3 Operational Costs

**Assumptions** (Year 1):
- Team: ₹1 crore/year (10 engineers × ₹10 lakh)
- Security audits: ₹10 lakh/year
- Training: ₹5 lakh/year
- Marketing: ₹20 lakh/year
- Total: ₹1.35 crore/year (~$170K)

**Total Year 1 Budget**: ₹2.35 crore (~$295K)

---

### 11.8 Risk Mitigation Summary

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **AWS outage** | Low | Critical | Multi-AZ, multi-region, automatic failover |
| **State resistance** | Medium | High | Central mandate, pilot programs, easy SDK |
| **Low user adoption** | Medium | High | Marketing, partnerships, government push |
| **Data privacy concerns** | High | Medium | Transparent policies, user controls, compliance |
| **Telecom delays** | Medium | High | Early engagement, multi-operator redundancy |
| **False SOS overload** | High | High | 30s cancellation, ML filtering, user education |
| **Security breach** | Low | Critical | Defense in depth, regular audits, bug bounty |
| **Budget overrun** | Medium | Medium | Phased rollout, cost monitoring, optimization |
| **Crime data unavailable** | Medium | Medium | Crowdsourcing, proxy indicators, NGO partnerships |
| **Police training gaps** | High | Medium | Comprehensive training, ongoing support, manuals |

---

## 12. Future Enhancements

### 12.1 Phase 2 (Year 2-3)

**AI Enhancements**:
- Predictive policing (patrol route optimization)
- Sentiment analysis (detect distress in voice/text)
- Computer vision (weapon detection in evidence)

**Integration Enhancements**:
- Wearable devices (smartwatch SOS)
- Public transport integration (bus/train safety)
- Workplace safety module

**Feature Enhancements**:
- AI-powered fake call (escape scenarios)
- Blockchain evidence chain (tamper-proof)
- Mental health crisis support

---

### 12.2 Phase 3 (Year 4-5)

**International Expansion**:
- Support for foreign travelers
- Multi-country SOS relay
- 50+ languages

**Advanced Analytics**:
- Predictive incident modeling
- Resource optimization AI
- Policy impact simulation

**Ecosystem**:
- Legal aid marketplace
- Insurance integration
- NGO coordination platform

---

## 13. Conclusion

The SAKHI platform is designed as a **serverless, cloud-native, AI-powered** national safety grid that:

1. **Scales automatically** from 10M to 100M+ users
2. **Responds in <200ms** to life-critical SOS triggers
3. **Works offline** via SMS/IVR for 600M+ feature phone users
4. **Predicts and prevents** incidents using AI/ML
5. **Federates seamlessly** across 28+ state boundaries
6. **Complies fully** with India's data protection regulations
7. **Costs efficiently** at ~₹2.35 crore/year for Year 1

**Key Differentiators**:
- Zero cold start for SOS (Provisioned Concurrency)
- Multi-channel alerting (SMS, push, voice)
- Auto-FIR generation (legal compliance)
- Silent evidence collection (privacy-preserving)
- National heatmap (policy insights)

**Success Metrics**:
- 10M users in Year 1
- 30% reduction in response time
- 99.95% SOS endpoint uptime
- 20+ states integrated

---

**Document Version**: 1.0  
**Last Updated**: February 15, 2026  
**Owner**: SAKHI Technical Team  
**Reviewers**: AWS Solutions Architects, Ministry of Home Affairs  
**Status**: Final - Ready for Implementation

---

*For technical questions, contact: tech@sakhi.gov.in*  
*For architecture reviews, contact: architecture@sakhi.gov.in*
