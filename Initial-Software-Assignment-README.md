# IkigoriSmart

**AI-powered Maize Lethal Necrosis (MLN) disease detection system for Rwandan farmers**

---

## Description

IkigoriSmart is an agricultural technology solution that helps Rwandan farmers detect Maize Lethal Necrosis (MLN) disease in their crops at early stages. MLN is a devastating disease that can cause up to 100% crop loss, significantly impacting food security and farmer livelihoods.

The system uses machine learning and computer vision to analyze images of maize crops and classify the disease severity into three stages: **Early**, **Moderate**, and **Severe**. Farmers can access the platform through a web application or mobile app, available in both English and Kinyarwanda.

### Key Features:

- Image-based MLN disease detection
- Cross-platform mobile and web applications
- Bilingual support (English & Kinyarwanda)
- Disease tracking and analytics

---

### GitHub Repository

**Repository:** [https://github.com/pimanzi/IkigoriSmart](https://github.com/pimanzi/IkigoriSmart)

### Video Demonstration

Watch IkigoriSmart in action:

🔗 **[Demo Video](https://drive.google.com/drive/folders/1ZdNwWo2Be-FvCYdTrAOmDwoWh7IPMwR5?usp=sharing)**

### Figma Design Mockups

View complete design system and UI mockups:

🔗 **[Figma Design File](https://www.figma.com/design/2xjXZdjWGVQKxT1oi0lZo6/IkigoriSmart?node-id=0-1&t=1rRqrp34MHqDM3Cm-1)**

---

## Environment Setup and Installation

## Environment Setup and Installation

### Prerequisites

- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **Python 3.9** - [Download](https://python.org/)
- **Conda** (Anaconda/Miniconda) - [Download](https://docs.conda.io/)
- **Git** - [Download](https://git-scm.com/)
- **Expo CLI** - `npm install -g expo-cli`

### 1. Clone the Repository

```bash
git clone https://github.com/pimanzi/IkigoriSmart.git
cd IkigoriSmart
```

### 2. Machine Learning Model Setup

```bash
# Navigate to Model directory
cd Model

# Create Conda environment
conda env create -f environment.yml

# Activate environment
conda activate ikigori_mln

# Launch Jupyter (optional)
jupyter notebook notebooks/
```

### 3. Web Application Setup

```bash
# Navigate to webapp directory
cd webapp

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173
```

### 4. Mobile Application Setup

```bash
# Navigate to mobileapp directory
cd mobileapp

# Install dependencies
npm install

# Start Expo development server
npm start

# Scan QR code with Expo Go app or press:
# - 'i' for iOS simulator
# - 'a' for Android emulator
# - 'w' for web browser
```

---

## Designs

### Figma Design Mockups

View complete design system and UI mockups:

🔗 **[Figma Design File](https://www.figma.com/design/2xjXZdjWGVQKxT1oi0lZo6/IkigoriSmart?node-id=0-1&t=1rRqrp34MHqDM3Cm-1)**

### Web Application Interface

#### Login Page

<div align="center">
  <img width="1246" height="786" alt="image" src="https://github.com/user-attachments/assets/b1a0085f-cd23-4b83-a9cc-55c8f285ac2e" />
  <p><em>Login page with bilingual support (English/Kinyarwanda) and Google OAuth</em></p>
</div>

---

## 🎬 Demo

### Video Demonstration

Watch IkigoriSmart in action:

🔗 **[Demo Video](https://drive.google.com/drive/folders/1ZdNwWo2Be-FvCYdTrAOmDwoWh7IPMwR5?usp=sharing)**

---


##  Deployment Plan

### Phase 1: Development & Testing

- ML model training and validation
- Web and mobile application development
- Integration testing

### Phase 2: Staging Deployment

| Component         | Platform                            | Timeline |
| ----------------- | ----------------------------------- | -------- |
| ML Model API      | AWS Lambda / Google Cloud Functions | Week 1-2 |
| Web Application   | Vercel / Netlify                    | Week 2   |
| Database          | Supabase / AWS RDS                  | Week 2   |
| Mobile App (Beta) | Expo EAS Build                      | Week 3   |

### Phase 3: Production Deployment

| Component        | Platform                | Configuration                   |
| ---------------- | ----------------------- | ------------------------------- |
| **Frontend**     | Vercel /netlify         | Auto-deploy from main branch    |
| **Mobile App**   | Google Play & App Store | EAS production build            |
| **ML Model**     | AWS                     | Auto-scaling inference endpoint |
| **Database**     | Supabase                | PostgreSQL with backups         |
| **File Storage** | Supabase                | Image storage                   |

### Phase 4: Optimization & Scale

- Implement CDN for faster image loading
- Add offline mode for mobile app
- Optimize ML model for edge deployment

=

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  
**IkigoriSmart** - Protecting Rwandan maize crops with AI

</div>
