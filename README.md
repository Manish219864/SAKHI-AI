# SAKHI-AI

> **Note:** This project is a submission for the AWS AI for Bharat Hackathon. The following document outlines the **complete vision** for SAKHI. The current prototype implements a subset of these features (see [Current Status](#current-status) below). All AWS services and features described are part of the planned architecture.
>
> ## Current Status (MVP)

The current prototype (submitted for the hackathon) includes:

- ✅ Unified Safety Profile (basic)
- ✅ Cross-State SOS Relay (simulated)
- ✅ Feature Phone Support (IVR mockup)
- ✅ Safe Route Planner (UI demo)
- ✅ Basic SOS trigger with alerts

All other features are part of the future roadmap and are described here to illustrate the full potential of the solution.

# SAKHI – National Women's Safety Interoperability Grid

**SAKHI** is an AI‑powered interoperability platform that connects India's 28+ fragmented state women safety apps into one unified national grid. It enables cross‑state emergency alerts, unified user profiles, and predictive AI‑based risk detection for women in public spaces. The solution works on both smartphones and feature phones via voice, SMS, and IVR in 12+ Indian languages, making it accessible to rural and semi‑urban women across Bharat.

> **“SAKHI is the UPI for women's safety – a national interoperability grid connecting every state's safety system into one unified response network.”**

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Unique Selling Proposition](#unique-selling-proposition)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Team](#team)
- [License](#license)

---

## Problem Statement

- **28+ state‑specific safety apps** (T‑Safe, Shakti, Pink Shakti, Himmat) **cannot communicate** with each other.
- A woman traveling from Delhi to Hyderabad must install **4 different apps**; her emergency data **does not travel** with her.
- **600 million feature phone users** are excluded from existing solutions.
- Current apps are **reactive** (“call police”), but police response takes 8‑12 minutes – danger happens in **30 seconds**.
- **Every 16 minutes** a woman faces violence in India; **93%** feel unsafe on public transport. (Sources: NCRB 2022, NFHS‑5)

---

## Our Solution

SAKHI is **not another safety app** – it is the **missing interoperability layer** that connects every state app into one national grid, much like UPI connected 50+ payment apps.

### Three‑Layer Architecture

| Layer | Description | Timeline |
|-------|-------------|----------|
| **Unified Identity** | One Sakhi ID works across ALL state apps. Register once – profile travels with you. | Immediate |
| **Cross‑State Relay** | SOS from Karnataka automatically alerts family in Bihar via secure encrypted relay. | Month 1‑3 |
| **Predictive AI Safety** | AI predicts high‑risk zones using crime data. *“87% risk on MG Road 7‑9pm – avoid.”* | Month 3‑6 |

---

## Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Unified Safety Profile** | One ID works across 28+ state apps – register once, use everywhere. |
| 2 | **Cross‑State SOS Relay** | Emergency alert travels across state borders instantly (e.g., Karnataka SOS → Bihar family SMS). |
| 3 | **Feature Phone Support** | Dial *7890 or give a missed call to trigger SOS via IVR. Includes 600M women. |
| 4 | **Safe Route Predictor** | AI shows the safest path (not shortest) using crime data, lighting, and isolation analysis. |
| 5 | **Vernacular Voice AI** | 12+ Indian languages with Amazon Polly & Transcribe; works in noisy streets. |
| 6 | **Auto‑FIR Generator** | One tap generates a complete FIR with attached evidence using Amazon Bedrock (Llama 3). |
| 7 | **Silent Evidence Mode** | Records audio + location **without opening the phone** – evidence without attacker knowing. |
| 8 | **National Safety Heatmap** | Real‑time crime zone dashboard for the Ministry of Home Affairs (Amazon QuickSight). |
| 9 | **Predictive Risk AI** | “87% chance of crime in this area, 7‑9pm” – proactive warnings. |
| 10 | **Legacy App SDK** | 10‑line code; any state app joins the Sakhi grid in under 1 hour. |
| 11 | **Trusted Circle Auto‑Alert** | Family notified automatically when user deviates from routine path at odd hours. |
| 12 | **Offline Mode** | SMS‑based emergency works without internet – ideal for remote areas. |
| 13 | **Area Risk Check** | Check safety score of any area before visiting. |
| 14 | **Scheduled Check‑in** | Set expected arrival time; if not checked in, auto‑alert triggers. |
| 15 | **Volunteer Network** | Nearby trained volunteers receive alerts and can respond before police. |

---

## Unique Selling Proposition

- **UPI for Safety** – First‑ever national interoperability grid connecting 28+ state apps.
- **Bharat‑First Design** – Works on ₹1500 feature phones via missed call, SMS, IVR in 12+ languages.
- **Predictive AI** – Not reactive “call police” but proactive “don't go there at 9 PM.”
- **Government‑Ready** – Built for Nirbhaya Fund, Smart City missions, Ministry of Home Affairs.
- **Legacy App SDK** – 10‑line code; any state app joins in 1 hour – zero rebuilding.

---

## Technology Stack

### AWS Services (30+)

| Category | AWS Services |
|----------|--------------|
| **Compute** | AWS Lambda, Lambda Provisioned Concurrency, Lambda@Edge, Step Functions |
| **API** | Amazon API Gateway |
| **Storage** | Amazon S3 + KMS, Amazon RDS (PostgreSQL), Amazon DynamoDB, Amazon ElastiCache |
| **AI/ML** | Amazon SageMaker (XGBoost), Amazon Bedrock (Llama 3), Amazon Polly, Amazon Transcribe, Amazon Rekognition |
| **Integration** | Amazon SNS, Amazon SQS, Amazon EventBridge, Amazon Connect |
| **Security** | AWS KMS, AWS WAF, AWS Shield, AWS IAM, Amazon Cognito, Amazon GuardDuty |
| **Networking** | Amazon CloudFront |
| **Monitoring** | Amazon CloudWatch, AWS CloudTrail, AWS X‑Ray |
| **Analytics** | Amazon Athena, Amazon QuickSight |
| **DevOps** | AWS Amplify, AWS CodePipeline, AWS SAM, AWS CloudFormation |

### Frontend & Languages

- **Mobile App:** React Native, Redux Toolkit, NativeBase, Tailwind CSS, Google Maps SDK
- **Languages:** JavaScript/TypeScript, Node.js, Python

---

## Architecture Overview

![SAKHI Architecture](docs/architecture-diagram.png)  
*For a detailed architecture diagram, see [design.md](design.md).*

- **Presentation Layer:** React Native app + Amazon Connect IVR for feature phones.
- **Application Layer:** Serverless AWS Lambda functions (auth, SOS, route planning, FIR generation, etc.) exposed via API Gateway.
- **AI/ML Layer:** SageMaker for risk prediction, Bedrock for FIR generation, Polly/Transcribe for voice.
- **Data Layer:** RDS for profiles, DynamoDB for real‑time location, S3 for encrypted evidence.
- **Integration Layer:** SDK (Lambda@Edge) for state apps, third‑party APIs (Google Maps, police systems).

The system is **100% serverless**, auto‑scales from one to millions of users, and delivers **SOS response in <200ms** thanks to Provisioned Concurrency.

---

## Getting Started

### Prerequisites
- Node.js 20.x, Python 3.11
- AWS CLI configured with appropriate credentials
- Amplify CLI

### Installation

1. Clone the repository  
   ```bash
   git clone https://github.com/your-team/sakhi.git
   cd sakhi
