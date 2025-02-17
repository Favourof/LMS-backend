# Online Learning Management System (LMS)

This is an **Online Learning Management System (LMS)** built using React.js, Node.js, Express, and Firebase Storage. It allows students to enroll in courses, track their progress, and interact with course materials, while administrators can create and manage courses.

## Features

- User authentication (Signup/Login)
- Role-based access control (Admin & Student)
- Course creation and management (Admin)
- Course enrollment and progress tracking (Student)
- Firebase Storage for file uploads (Course materials)
- Responsive and user-friendly UI
- Protected routes for authenticated users
- Real-time toast notifications

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js.
- **Database:** Mongodb
- **Storage:** Firebase Storage
- **State Management:** Context API
- **Authentication:** JWT-based authentication

## API Endpoints

### Authentication

| Method | Endpoint            | Description                                           |
|--------|---------------------|-------------------------------------------------------|
| POST   | /api/auth/register  | Register a new user                                   |
| get    | /api/auth/login     | Authenticate user and return token                    |
| POST   | /api/auth/users     | Authenticate user decryt token and restrict to Admin  |

### Course Management (Admin)

| Method | Endpoint                     | Description                         |
|--------|------------------------------|-------------------------------------|
| POST   | /api/courses                 | Create a new course                 |
| GET    | /api/courses/                | Get all courses                     |
| GET    | /api/courses/admin           | Get courses created by admin        |
| GET    | /api/courses/:id             | Get course by ID                    |
| PUT    | /api/courses/:id             | Update course details               |
| PUT    | /api/courses/:id/modules     | Add modules to a particular course  |
| PUT    | /api/courses/:id/module      | Update a specific module            |
| DELETE | /api/courses/:id             | Delete a course                     |

### Enrollment (Student)

| Method | Endpoint                    | Description                 |
|--------|-----------------------------|-----------------------------|
| POST   | /progress/enroll/:courseId       | Enroll in a course          |
| GET    | /progress/complete/:courseId     | complete a specific mudule  |
| DELETE | /progress/:courseId              | Unenroll from a course      |

### Feedback

| Method | Endpoint                    | Description                 |
|--------|-----------------------------|-----------------------------|
| POST   | /api/feedback/:courseId     | Submit feedback for a course|
| GET    | /api/feedback/:courseId     | Get feedback for a course   |

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/lms.git
   cd lms
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file:

   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   FIREBASE_STORAGE_BUCKET=your_firebase_bucket
   FIREBASE_PROJECT_ID
   FIREBASE_PRIVATE_KEY_ID
   FIREBASE_CLIENT_EMAIL
   NODE_ENV = "development" || production
   ```

4. Run the development server:

   ```
   npm run dev
   ```



## License

This project is licensed under the MIT License.
