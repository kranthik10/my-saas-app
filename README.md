# Video Processing SaaS

A SaaS application that allows users to transcribe and translate video/audio content using OpenAI's API.

## Features

- User registration and authentication
- Video/audio transcription using OpenAI's Whisper API
- Video/audio translation using OpenAI's API
- Credit-based system for processing
- Subscription plans with Stripe integration
- Processing history tracking

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB/Mongoose
- **Authentication**: JWT
- **Payments**: Stripe
- **AI API**: OpenAI

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- OpenAI API key
- Stripe account (for payments)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd saas-video-processing
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
cd backend
cp .env.example .env
```
Edit the `.env` file with your configuration.

4. Run the application:
```bash
# For development:
npm run dev

# For backend only:
npm run dev-backend

# For frontend only:
npm run dev-frontend
```

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/saas-videos
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
CLIENT_URL=http://localhost:3000
```

## Docker Setup

To run the application with Docker:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/users` - Register user
- `POST /api/auth` - Login user
- `GET /api/auth` - Get user profile (requires auth token)

### Video Processing
- `POST /api/videos/transcribe` - Transcribe audio/video (requires auth)
- `POST /api/videos/translate` - Translate audio/video (requires auth)
- `GET /api/videos` - Get user's processing history (requires auth)

### Payments
- `POST /api/payment/create-checkout-session` - Create Stripe checkout session (requires auth)

## Project Structure

```
saas-video-processing/
├── backend/              # Node.js/Express server
│   ├── config/           # Database and config files
│   ├── middleware/       # Auth and other middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── frontend/             # React/Vite client
│   ├── public/           # Public assets
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # React context
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   └── vite.config.js    # Vite configuration
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── README.md
```

## Deployment

### Heroku
This app is configured for Heroku deployment. Make sure to set the config vars in your Heroku dashboard.

### Other Platforms
The Docker configuration allows for easy deployment to platforms like AWS, GCP, or DigitalOcean.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT