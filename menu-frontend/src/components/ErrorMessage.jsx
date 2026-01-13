import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="bg-rust/10 border border-rust/30 rounded-2xl p-8 max-w-md animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-rust/20 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-rust" />
          </div>
          <h2 className="text-2xl font-display font-bold text-charcoal">
            Something went wrong
          </h2>
        </div>
        <p className="text-charcoal/70 leading-relaxed">
          {message || 'Unable to load menu. Please try again later.'}
        </p>
      </div>
    </div>
  );
};

export default ErrorMessage;
