# 🌐 URL Shortener

A powerful URL shortener built with NestJS, PostgreSQL, and TypeORM! This project aims to provide a robust, user-friendly, and feature-rich URL shortening service.

## 🚀 Features

- **URL Validation**: Ensure that only valid URLs are shortened. We use a library like `class-validator` for this purpose.
- **Custom Short URLs**: Allow users to specify their own custom short URLs if desired.
- **Expiration Dates**: Implement an expiration mechanism for short URLs, allowing users to set an expiry date.
- **Click Tracking**: Track the number of clicks on each short URL.
- **Rate Limiting**: Prevent abuse of the service with rate limiting.
- **User auth**: Register and login with JWT; create and manage "my links".
- **Redirect type (301/302)**: Choose permanent or temporary redirect for SEO.
- **QR codes**: `GET /api/url/:shortKey/qr` returns a PNG QR code.
- **Click history**: `GET /api/url/:shortKey/clicks` (owner only) with pagination.
- **URL info**: `GET /api/url/:shortKey/info` for stats without redirecting.

## 🛠️ Built With

- [NestJS](https://nestjs.com/): A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- [PostgreSQL](https://www.postgresql.org/): A powerful, open-source object-relational database system.
- [TypeORM](https://typeorm.io/): An ORM that can run in NodeJS, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, Expo, and Electron platforms, and can be used with TypeScript and JavaScript (ES5, ES6, ES7, ES8).

## 📚 Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- TypeORM

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/aryan445/URL-SHORTNER.git
   cd ShortenURLsWithNest

2. Install dependencies:
```sh
npm install
```

3. Configure the database and auth:
```sh
# Create a .env file and set:
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_MIGRATION_TABLE_NAME=migrations
JWT_SECRET=your-secret-key-min-32-chars  # required for auth
```

4. Run database migrations:
```sh
npm run migration:run:local
```

5. Start the server:
```sh
npm run start:dev
```

## 🔧 Usage

### URL Validation
Ensure only valid URLs are shortened using validator.

### Custom Short URLs
Allow users to create custom short URLs by specifying a desired alias.

### Expiration Dates
Set an expiry date for short URLs, after which they will no longer be accessible.

### Click Tracking
Track the number of clicks for each short URL to monitor usage.

### Rate Limiting
Prevent abuse by limiting the number of requests a user can make in a given time period.

## 🏗️ Architecture
- Custom Decorator: Uses a custom decorator to set rate limit metadata on routes.
- Interceptor: Implements an interceptor to handle rate limiting logic.
- Dependency Injection: Uses NestJS's dependency injection system and module structure.
- Reflector: Utilizes the Reflector to access metadata.
- HttpException: Throws a standard HttpException for rate limit errors.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes or enhancements you would like to see.

Happy coding! 🎉