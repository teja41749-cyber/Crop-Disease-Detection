# 🌱 Crop Disease Detection System

An AI-powered crop disease detection system that identifies crop diseases from leaf images and provides remedy information.

The project is designed with a **farmer-friendly, mobile-responsive interface** and currently supports **English and Marathi**.

---

## 📌 Project Overview

The system allows a user to upload or capture a crop leaf image.

The image is sent from the frontend to a FastAPI backend, where a trained **MobileNetV2** model predicts one of **59 classes**.

System Flow:

Leaf Image
    ↓
Farmer-Friendly Frontend
    ↓
FastAPI Backend
    ↓
Image Preprocessing
    ↓
MobileNetV2 Model
    ↓
59-Class Prediction
    ↓
Confidence + Remedy

Installation and running
Continue **immediately after Part 1**:

📥 Installation

1. Clone the Repository

Open PowerShell and run:

```powershell
git clone https://github.com/teja41749-cyber/Crop-Disease-Detection.git
