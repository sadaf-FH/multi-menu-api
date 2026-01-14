import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-8">
      <div className="bg-red-50 border-2 border-red-600 rounded-2xl p-8 max-w-md">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-red-600 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Error
          </h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {message || 'Unable to load menu. Please try again later.'}
        </p>
      </div>
    </div>
  );
};

export default ErrorMessage;
