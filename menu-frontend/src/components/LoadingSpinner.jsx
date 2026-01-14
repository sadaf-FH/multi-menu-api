const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
