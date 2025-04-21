
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blockchain-darkBlue text-white">
      <div className="text-center max-w-md px-4">
        <div className="w-24 h-24 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-blockchain-purple/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-3 bg-blockchain-darkBlue rounded-full flex items-center justify-center">
            <p className="text-4xl font-bold text-blockchain-purple">404</p>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-blockchain-purple">Page Not Found</h1>
        <p className="text-gray-400 mb-8">
          The decentralized file you're looking for seems to have been lost in the blockchain.
        </p>
        <Button
          asChild
          className="bg-blockchain-purple hover:bg-blockchain-darkPurple text-white glow-effect"
        >
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
