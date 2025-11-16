import { Link } from 'react-router-dom';
import { Button } from '@myapp/frontend/ui-components';
import { useAuth } from '@ai-chatbot/hooks';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Conversations',
      description:
        'Chat with advanced AI that understands context and provides intelligent responses.',
    },
    {
      icon: '💬',
      title: 'Multiple Conversations',
      description:
        'Organize your chats into separate conversations for different topics.',
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description:
        'Your conversations are encrypted and stored securely with industry-standard security.',
    },
    {
      icon: '⚡',
      title: 'Real-time Responses',
      description:
        'Get instant responses with streaming AI replies as they are generated.',
    },
    {
      icon: '📊',
      title: 'Usage Analytics',
      description:
        'Track your AI usage, conversation history, and token consumption.',
    },
    {
      icon: '🎨',
      title: 'Customizable',
      description:
        'Personalize your experience with themes, settings, and preferences.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your AI Assistant, Always Ready
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Experience intelligent conversations powered by cutting-edge AI
              technology. Get answers, insights, and assistance whenever you
              need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" variant="secondary">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to="/chatbot">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-white border-white hover:bg-white hover:text-primary-600"
                    >
                      Start Chatting
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="secondary">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-white border-white hover:bg-white hover:text-primary-600"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need for productive AI conversations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of users who are already having amazing
              conversations with AI.
            </p>
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="lg">Create Your Free Account</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AI Chatbot</h3>
              <p className="text-gray-400">
                Your intelligent conversation partner, powered by advanced AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/login" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white">
                    Sign Up
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link to="/dashboard" className="hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">support@aichatbot.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 AI Chatbot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
