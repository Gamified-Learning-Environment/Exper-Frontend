# Gamified Learning Environment (GLE) - Frontend

Welcome to the **Frontend Repository** for the Gamified Learning Environment (GLE) project! This project aims to improve online education by combining interactive quizzes, gamification elements, and AI-powered personalization into an engaging and intuitive learning platform.

## 🌟 Project Objectives
- Develope a **personalized learning platform** designed to engage students.
- Provide an **intuitive, responsive frontend** that enhances the user experience.
- Deliver gamified features such as **achievements, progress tracking, and leaderboards** to motivate students through their learning process.

## 🖼️ Features

### Core Frontend Features
1. **Responsive UI Design**:
   - Built with **Next.js** for server-side rendering, ensuring fast load times and efficient data handling.
   - Styled using **Tailwind CSS** and **shadcn/ui** for a polished and mobile-friendly interface.

2. **Gamified Elements**:
   - User achievements and badges.
   - Dynamic leaderboards for peer comparison.
   - Visual progress tracking with feedback.

3. **Interactive Quiz System**:
   - Supports **manual and AI-generated quizzes** via API integration with backend microservices.
   - Intuitive prompts for AI quiz generation.

4. **Feedback and Analytics**:
   - Displays detailed results with **D3.js-powered graphs**.
   - Highlights user strengths and areas for improvement.
   - Long-term progress tracking for both students and educators.


## 🚀 Technologies Used
The Frontend is Next.js, with extensive use of Shadcn-ui and Tailwind CSS.

Each Microservice is built using Python Flask.


## Microservices Integration
The frontend interacts with the following backend microservices:

- User Management Service: Handles user authentication and account details.
- Quiz Generation Service: Fetches manually created and AI-generated quizzes, quiz validation.
- Results Tracking Service: Retrieves user performance data for visualization.
- Gamification Service: Provides gamification data such as achievements and leaderboards, player instantiation.
- API calls are managed RESTfully for seamless communication with these microservices.


## Deployment and Running
While you could download, compile and run each of the repositories for this Final Year Project and get a more in depth look into the code, it is also fully deployed on Railway at the following link: https://exper-frontend-production.up.railway.app

Alternatively, here's a QR Code: 

![ExperQRCode](https://github.com/user-attachments/assets/57795718-9c35-462c-b257-03cf354f5bd4)

Should this not be sufficient for grading, please see the instructions below: 

### Prerequisites
Node.js (v18+) and npm/yarn
Python (v3.9+)
MongoDB database
API keys for:
OpenAI
Anthropic Claude (optional)
Google Gemini (optional)

### Setup and Installation
1. Clone each repository for this project.
2. For each microservice repeat these steps
      1. 
         ```
         cd service-directory  # e.g., Quiz-Generation-FYP
         python -m venv venv
         source venv/bin/activate  # On Windows: venv\Scripts\activate
         pip install -r requirements.txt
         ```
         
      2. Environmental Variables
         Create a .env file in each microservice directory with appropriate values:
         ```
            MONGODB_URI=mongodb://localhost:27017/quizdb
            OPENAI_API_KEY=your_openai_key
            ANTHROPIC_API_KEY=your_anthropic_key  # Optional
            GOOGLE_API_KEY=your_gemini_key  # Optional
         ```
         User Management Service
         ```
         MONGODB_URI=mongodb://localhost:27017/userdb
         JWT_SECRET=your_jwt_secret
         ```

         Results Tracking Service
         ```
         MONGODB_URI=mongodb://localhost:27017/resultsdb
         ```
         Gamification Service
         ```
         MONGODB_URI=mongodb://localhost:27017/gamificationdb
         ```

3. Frontend Setup
      ```
      cd Exper-Frontend/experfrontend
      npm install
      ```
      Create a .env.local file with:
      ```
      NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8080
      NEXT_PUBLIC_QUIZ_SERVICE_URL=http://localhost:9090
      NEXT_PUBLIC_RESULTS_SERVICE_URL=http://localhost:8081
      NEXT_PUBLIC_GAMIFICATION_SERVICE_URL=http://localhost:8082
      ```

4. Running the Application
   1. Start the microservices, run each in a seperate terminal:
      ```
      # Quiz Generation Service
      cd Quiz-Generation-FYP
      source venv/bin/activate  # On Windows: venv\Scripts\activate
      python app.py  # Will run on port 9090
      
      # User Management Service
      cd User-Management-Service
      source venv/bin/activate
      python app.py  # Will run on port 8080
      
      # Results Tracking Service
      cd Results-Tracking-FYP
      source venv/bin/activate
      python app.py  # Will run on port 8081
      
      # Gamification Service
      cd Gamification-FYP
      source venv/bin/activate
      python app.py  # Will run on port 8082
      ```
   2. Start the Frontend
      ```
      cd Exper-Frontend/experfrontend
      npm run dev
      ```
   Visit http://localhost:3000 to access the application.





