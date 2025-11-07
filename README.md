# YouTube Optimizer Frontend

A modern Angular application that provides YouTube content optimization tools and analytics. This frontend application works in conjunction with a NestJS backend to deliver comprehensive YouTube video audits and optimization recommendations.

## 🚀 Features

- **Video Audits**: Analyze YouTube videos for optimization opportunities
- **Dashboard**: Comprehensive analytics dashboard with video insights
- **History**: Track audits history and progress over time
- **User Authentication**: Secure login and registration system with JWT tokens
- **Profile Management**: User profile and settings management
- **Responsive Design**: Modern UI built with Angular Material
- **Real-time Updates**: Live updates using Angular Signals and RxJS

## 🛠️ Tech Stack

- **Frontend Framework**: Angular 20.2.0
- **UI Components**: Angular Material & Angular CDK
- **State Management**: NgRx Signals
- **Styling**: SCSS with custom theming
- **Authentication**: Supabase integration
- **HTTP Client**: Angular HttpClient with interceptors
- **Testing**: Jasmine & Karma

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Angular CLI** (v20.2.1 or higher)

## 🏃‍♂️ Quick Start

### 1. Backend Setup (Required)

**Important**: This frontend requires a NestJS backend to be running. Make sure to set up and start the backend server first:

```bash
# Clone and setup the backend repository
git clone [your-nestjs-backend-repo-url]
cd youtube-optimizer-backend
npm install
npm run start:dev
```

The backend should be running on `http://localhost:3000` by default.

### 2. Frontend Setup

```bash
# Clone this repository
git clone https://github.com/ahmedhmf/youtube-optimizer-FE.git
cd youtube-optimizer-FE

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at `http://localhost:4200`.

## 🔧 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Build and watch for changes
npm run watch

# Run unit tests
npm test

# Generate Angular CLI components/services
ng generate component component-name
ng generate service service-name
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── guard/              # Route guards (auth, public)
│   ├── interceptors/       # HTTP interceptors
│   ├── layout/            # Main application layout
│   ├── pages/             # Application pages
│   │   ├── dashboard/     # Dashboard with analyze & history
│   │   ├── home/          # Landing page
│   │   ├── login/         # Authentication
│   │   ├── profile/       # User profile
│   │   └── register/      # User registration
│   ├── services/          # API and business logic services
│   ├── stores/            # NgRx Signal stores
│   └── util/              # Utilities and constants
├── environments/          # Environment configurations
└── styles/               # Global styles and theming
```

## 🔐 Authentication

The application uses a combination of Supabase and JWT tokens for authentication:

- **Public routes**: `/login`, `/register`
- **Protected routes**: All dashboard and profile routes
- **Guards**: Automatic redirection based on authentication status

## 🌐 API Integration

The frontend communicates with a NestJS backend API:

- **Base URL**: `http://localhost:3000` (development)
- **Authentication**: JWT tokens via HTTP interceptors
- **Error Handling**: Centralized error handling and user feedback

## 🎨 Theming

The application uses a custom Angular Material theme located in `src/styles/_descripta-theme.scss`. You can customize colors, typography, and component styles by modifying this file.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test -- --code-coverage

# Run tests in watch mode
npm run test -- --watch
```

## 🏗️ Building for Production

```bash
# Build for production
npm run build

# The build artifacts will be stored in the `dist/` directory
```

## 📦 Dependencies

### Main Dependencies
- **@angular/core**: Core Angular framework
- **@angular/material**: Material Design components
- **@ngrx/signals**: State management
- **@supabase/supabase-js**: Authentication and database
- **rxjs**: Reactive programming

### Development Dependencies
- **@angular/cli**: Angular CLI tools
- **typescript**: TypeScript compiler
- **jasmine**: Testing framework
- **karma**: Test runner

## 🚨 Important Notes

1. **Backend Dependency**: This frontend application requires the NestJS backend to be running for full functionality.

2. **Environment Configuration**: Update the `environment.ts` and `environment.development.ts` files with your backend URL and other configuration values.

3. **Authentication Setup**: Configure Supabase credentials in your environment files for authentication to work properly.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**: Ensure the NestJS backend is running on `http://localhost:3000`
2. **Authentication Issues**: Check Supabase configuration in environment files
3. **Build Errors**: Clear node_modules and reinstall dependencies: `rm -rf node_modules && npm install`

### Getting Help

If you encounter any issues or have questions, please:
1. Check the existing issues in the repository
2. Create a new issue with detailed information about the problem
3. Include error messages, browser console logs, and steps to reproduce

## 📞 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.
