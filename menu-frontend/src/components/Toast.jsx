import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />
  };

  const styles = {
    success: 'bg-green-600 border-green-700',
    error: 'bg-red-600 border-red-700',
    info: 'bg-blue-600 border-blue-700'
  };

  return (
    <div className={`fixed top-6 right-6 z-50 ${styles[type]} text-white px-6 py-4 rounded-xl shadow-2xl border-2 flex items-center gap-4 min-w-[320px] max-w-md animate-slide-in`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white/20 p-1 rounded transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;