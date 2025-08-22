import { useState, useEffect } from 'react';
import { Spinner } from 'flowbite-react';

const PageWrapper = ({ children, isLoading = false, minLoadTime = 200 }) => {
  const [showContent, setShowContent] = useState(false);
  const [hasMinTimePassed, setHasMinTimePassed] = useState(false);

  useEffect(() => {
    // Minimum loading time to prevent flickering
    const timer = setTimeout(() => {
      setHasMinTimePassed(true);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  useEffect(() => {
    if (!isLoading && hasMinTimePassed) {
      setShowContent(true);
    }
  }, [isLoading, hasMinTimePassed]);

  if (isLoading || !showContent) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {children}
    </div>
  );
};

export default PageWrapper;
