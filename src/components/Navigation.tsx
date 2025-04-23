
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Key, Settings } from "lucide-react";

interface NavigationProps {
  showPinataSetup?: boolean;
}

export const Navigation = ({ showPinataSetup }: NavigationProps) => {
  if (!showPinataSetup) return null;

  return (
    <Button variant="ghost" asChild className="mr-4">
      <Link to="/pinata-setup" className="flex items-center gap-2">
        <Key className="h-4 w-4" />
        <span>Pinata Settings</span>
      </Link>
    </Button>
  );
};
