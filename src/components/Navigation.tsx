
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Key, Settings } from "lucide-react";

interface NavigationProps {
  showPinataSetup?: boolean;
}

export const Navigation = ({ showPinataSetup }: NavigationProps) => {
  if (!showPinataSetup) return null;

  return (
    <Button variant="ghost" asChild className="mr-4 card-hover glass-effect border border-blockchain-purple/20">
      <Link to="/pinata-setup" className="flex items-center gap-2 px-4 py-2">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-blockchain-purple/20 to-blockchain-teal/20 flex items-center justify-center">
          <Key className="h-3 w-3 text-blockchain-purple" />
        </div>
        <span className="font-medium">Pinata Settings</span>
      </Link>
    </Button>
  );
};
