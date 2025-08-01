# FinanceTracker - Intelligent Finance Assistant

A modern, beautiful, and professional finance tracking application built with Next.js and Tailwind CSS. Take control of your financial future with smart analytics, budget planning, and secure data management.

## 🚀 Features

- **Beautiful Landing Page** - Modern design with hero section, features showcase, and call-to-action
- **Professional Login/Registration** - Clean, responsive forms with validation and social login options
- **Smart Analytics** - AI-powered insights into spending patterns and financial health
- **Budget Planning** - Create personalized budgets and track progress with intelligent goal-setting
- **Secure & Private** - Bank-level security ensures your financial data is always protected
- **Responsive Design** - Works perfectly on all devices and screen sizes
- **Modern UI/UX** - Beautiful gradients, smooth animations, and professional styling

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom implementation (ready for integration)
- **Deployment**: Ready for Vercel, Netlify, or any hosting platform

## 📁 Project Structure

```
finance-assistant/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles
│   │   ├── layout.js            # Root layout with metadata
│   │   ├── page.js              # Landing page
│   │   ├── login/
│   │   │   └── page.js          # Login page
│   │   └── register/
│   │       └── page.js          # Registration page
│   ├── components/
│   │   ├── Button.js            # Reusable button component
│   │   ├── Input.js             # Reusable input component
│   │   └── Logo.js              # Reusable logo component
│   ├── lib/
│   │   └── db.js                # Database configuration
│   └── models/
│       ├── User.js              # User model
│       └── Transactions.js      # Transaction model
├── package.json
└── README.md
```

## 🎨 Design Features

### Landing Page
- Hero section with compelling copy and call-to-action buttons
- Feature showcase with icons and descriptions
- Professional navigation with logo and links
- Footer with branding and links

### Login Page
- Clean, centered form design
- Password visibility toggle
- Remember me functionality
- Social login options (Google)
- Links to registration and password recovery

### Registration Page
- Multi-step form with name, email, and password fields
- Password strength requirements
- Terms and conditions checkbox
- Benefits section highlighting free trial
- Social registration options

### Components
- **Logo**: Reusable component with different sizes
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Input**: Form inputs with validation and password toggle

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Key Features

### Responsive Design
- Mobile-first approach
- Beautiful on all screen sizes
- Touch-friendly interface

### Modern Styling
- Gradient backgrounds
- Smooth animations and transitions
- Professional color scheme
- Custom scrollbars

### Form Validation
- Real-time validation
- Error handling
- Loading states
- Accessibility features

### Performance
- Optimized images and assets
- Fast loading times
- SEO-friendly metadata
- Progressive enhancement

## 🔧 Customization

### Colors
The app uses a blue-to-indigo gradient theme. You can customize colors in the Tailwind classes throughout the components.

### Components
All components are modular and reusable. You can easily modify the Button, Input, and Logo components to match your brand.

### Styling
The app uses Tailwind CSS with custom utilities. All styling is done through className attributes as requested.

## 📱 Pages

### Landing Page (`/`)
- Hero section with compelling copy
- Feature showcase
- Call-to-action buttons
- Professional navigation

### Login Page (`/login`)
- Email and password fields
- Remember me checkbox
- Forgot password link
- Social login options
- Link to registration

### Registration Page (`/register`)
- First and last name fields
- Email and password fields
- Password confirmation
- Terms and conditions
- Benefits section

## 🚀 Deployment

The app is ready for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@financetracker.com or create an issue in the repository.

---

Built with ❤️ using Next.js and Tailwind CSS
