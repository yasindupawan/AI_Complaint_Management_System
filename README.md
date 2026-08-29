# AI-Powered Multilingual Public Complaint Classification and Priority Management System for Sri Lanka

A web-based public complaint management system designed for the Sri Lankan public-service context to support the submission, classification, prioritization, routing, tracking, and management of public complaints.

The system supports **English, Sinhala, and Tamil** and integrates Artificial Intelligence (AI) and Natural Language Processing (NLP) techniques to assist complaint processing and administrative decision-making.

## Main Features

- Citizen registration and secure login
- Email OTP verification
- Role-based access for Citizens, Officers, and Administrators
- Multilingual complaint submission in English, Sinhala, and Tamil
- Supporting image upload
- Complaint location submission
- AI-based complaint category classification
- AI-based complaint priority prediction
- Semantic duplicate complaint detection
- Location-aware duplicate detection
- Administrator duplicate review and confirmation
- Automatic department recommendation and routing
- Manual complaint assignment to officers
- Officer complaint management workflow
- Complaint status tracking and history
- Citizen notifications
- Administrative dashboard and analytics
- Geographical complaint analysis
- Report generation

## AI / NLP Components

### Complaint Category Classification

The complaint category classification model uses **TF-IDF with a Calibrated Linear SVM** to classify complaints into six categories:

- Roads
- Water Supply
- Drainage
- Electricity
- Garbage
- Environment

The final model was trained using **9,000 records** and evaluated using an independent unseen test dataset of **300 records**, achieving an accuracy of **97.00%**.

### Complaint Priority Prediction

The priority prediction model uses **TF-IDF with a Calibrated Linear SVM** to classify complaints into:

- Low
- Medium
- High

The model was trained using **3,000 records** and evaluated using **150 unseen test records**, achieving an accuracy of **89.33%**.

### Duplicate Complaint Detection

Semantic duplicate detection is implemented using the **Sentence Transformer `all-MiniLM-L6-v2`** model.

Duplicate detection considers semantic similarity together with complaint category, recency, and geographical proximity. Potential duplicate complaints can be reviewed by an administrator before a final decision is made.

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### AI / NLP
- Python
- FastAPI
- Scikit-learn
- TF-IDF
- Calibrated Linear SVM
- Sentence Transformers

### Other Tools and Services
- JWT Authentication
- Cloudinary
- Nodemailer
- Postman
- Git
- GitHub

## Dataset Sources

Complaint-related datasets were cleaned, categorized, and prepared for the development and evaluation of the AI components.

### Local Complaint Data

Local complaint data related to the Sri Lankan public-service context, including complaint information relevant to the Kegalle area, was considered during dataset preparation and domain analysis.

### NYC 311 Service Requests

The NYC 311 Service Requests dataset was also used as an external public complaint data source.

Dataset:

https://www.kaggle.com/datasets/new-york-city/ny-311-service-requests

Relevant complaint types and descriptors were selected and processed according to the complaint categories required by the proposed system.

## Project Structure

AI_Complaint_Management_System/

- `frontend/` - React web application
- `backend/` - Node.js and Express REST API
- `ai-service/` - Python/FastAPI AI and NLP service
- `datasets/` - Dataset preparation and related resources
- `docs/` - Project documentation

## Complaint Processing Workflow

Citizen Complaint Submission  
↓  
Language Detection and Multilingual Processing  
↓  
AI Category Classification  
↓  
AI Priority Prediction  
↓  
Semantic and Location-Aware Duplicate Detection  
↓  
Duplicate Review (when required)  
↓  
Department Routing  
↓  
Officer Assignment  
↓  
Complaint Processing and Status Updates  
↓  
Citizen Notification and Tracking

## Security

The system includes:

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Password protection
- Email OTP verification
- NIC-based account validation
- Protected backend routes
- Server-side request validation
- Controlled image uploads

Sensitive credentials and environment variables should not be committed to the repository.

## Testing

The system has been tested across major functional and integration areas, including:

- Registration and authentication
- Role-based authorization
- Complaint submission
- Image and location submission
- English, Sinhala, and Tamil complaint processing
- AI category classification
- AI priority prediction
- Duplicate detection and administrative review
- Department routing
- Officer assignment
- Complaint status workflow
- Notifications
- Analytics and geographical analysis
- Report generation

API functionality was tested using **Postman**, together with frontend and database verification.

## Project Status

**Final Year Academic Project – Implemented and Tested.**

The major functional requirements and AI-assisted complaint-processing components have been implemented and evaluated. AI predictions are intended to support administrative decision-making rather than replace human judgement.

## Author

**Yasindu Pawan Bimsara Perera**  
**Student ID:** 20311776 / CL/BSCSD/33/83 
**Programme:** BSc Software Engineering  
**Institution:** International College of Business & Technology (ICBT)  
**Affiliated University:** Cardiff Metropolitan University



